const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const { authMiddleware } = require("../middleware/auth");
const {
  prisma,
  unavailable,
  isAllowedFile,
  encryptFile,
  encryptText,
  decryptText,
  documentFilename,
  sendPrivateFile,
} = require("../lib/portalSecurity");

const router = express.Router();
router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  res.set("X-Content-Type-Options", "nosniff");
  next();
});
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});
const documentSelect = {
  id: true,
  kind: true,
  filename: true,
  mimeType: true,
  size: true,
  vendor: true,
  amount: true,
  uploadedBy: true,
  createdAt: true,
};

function run(handler) {
  return (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);
}

function uploadOne(req, res, next) {
  upload.single("file")(req, res, (error) => {
    if (!error) return next();
    res
      .status(400)
      .json({
        error:
          error.code === "LIMIT_FILE_SIZE"
            ? "El archivo supera los 10 MB."
            : "No se pudo cargar el archivo.",
      });
  });
}

function validMeetingUrl(value) {
  if (!value) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function publicAccount(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

router.use(unavailable, authMiddleware);

router.get(
  "/summary",
  run(async (req, res) => {
    const [students, clients, organizations, cases, pending, unreadMessages] =
      await Promise.all([
        prisma.portalUser.count({ where: { role: "STUDENT" } }),
        prisma.portalUser.count({ where: { role: "CLIENT" } }),
        prisma.clientOrganization.count(),
        prisma.clientCase.count(),
        prisma.clientCase.count({
          where: { status: { in: ["REQUESTED", "QUOTING"] } },
        }),
        prisma.caseComment.count({
          where: { authorRole: "CLIENT", readByKadimaAt: null },
        }),
      ]);
    res.json({
      students,
      clients,
      organizations,
      cases,
      pending,
      unreadMessages,
    });
  }),
);

router.get(
  "/organizations",
  run(async (req, res) => {
    res.json(
      await prisma.clientOrganization.findMany({
        orderBy: { name: "asc" },
        include: { _count: { select: { users: true, cases: true } } },
      }),
    );
  }),
);

router.post(
  "/organizations",
  run(async (req, res) => {
    const name = String(req.body?.name || "").trim();
    if (name.length < 3 || name.length > 120)
      return res
        .status(400)
        .json({ error: "Ingresá el nombre de la institución." });
    const organization = await prisma.clientOrganization.create({
      data: { name },
    });
    res.status(201).json(organization);
  }),
);

router.put(
  "/organizations/:id",
  run(async (req, res) => {
    const id = Number(req.params.id);
    const name = String(req.body?.name || "").trim();
    if (
      !Number.isInteger(id) ||
      name.length < 3 ||
      name.length > 120 ||
      typeof req.body?.active !== "boolean"
    ) {
      return res.status(400).json({ error: "Datos de institución inválidos." });
    }
    res.json(
      await prisma.clientOrganization.update({
        where: { id },
        data: { name, active: req.body.active },
      }),
    );
  }),
);

router.get(
  "/users",
  run(async (req, res) => {
    const role = req.query.role;
    if (!["STUDENT", "CLIENT"].includes(role))
      return res.status(400).json({ error: "Tipo de usuario inválido." });
    const users = await prisma.portalUser.findMany({
      where: { role },
      include: {
        organization: { select: { id: true, name: true } },
        enrollments: {
          include: { course: { select: { id: true, titulo: true } } },
        },
      },
      orderBy: { name: "asc" },
    });
    res.json(users.map(publicAccount));
  }),
);

router.post(
  "/users",
  run(async (req, res) => {
    const role = req.body?.role;
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || "");
    const organizationId =
      role === "CLIENT" ? Number(req.body?.organizationId) : null;
    if (
      !["STUDENT", "CLIENT"].includes(role) ||
      name.length < 3 ||
      name.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      password.length < 10 ||
      (role === "CLIENT" && !Number.isInteger(organizationId))
    ) {
      return res
        .status(400)
        .json({
          error:
            "Completá nombre, email, contraseña de al menos 10 caracteres e institución si corresponde.",
        });
    }
    if (role === "CLIENT") {
      const organization = await prisma.clientOrganization.findUnique({
        where: { id: organizationId },
      });
      if (!organization?.active)
        return res.status(400).json({ error: "Elegí una institución activa." });
    }
    const user = await prisma.portalUser.create({
      data: {
        role,
        name,
        email,
        passwordHash: await bcrypt.hash(password, 12),
        organizationId,
      },
    });
    res.status(201).json(publicAccount(user));
  }),
);

router.put(
  "/users/:id",
  run(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id))
      return res.status(400).json({ error: "Usuario inválido." });
    const current = await prisma.portalUser.findUnique({ where: { id } });
    if (!current)
      return res.status(404).json({ error: "Usuario no encontrado." });
    const name = String(req.body?.name || current.name).trim();
    const email = String(req.body?.email || current.email)
      .trim()
      .toLowerCase();
    const password = req.body?.password ? String(req.body.password) : null;
    if (
      name.length < 3 ||
      name.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      (password && password.length < 10) ||
      typeof req.body?.active !== "boolean"
    ) {
      return res.status(400).json({ error: "Datos de usuario inválidos." });
    }
    const user = await prisma.portalUser.update({
      where: { id },
      data: {
        name,
        email,
        active: req.body.active,
        ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}),
      },
    });
    res.json(publicAccount(user));
  }),
);

router.get(
  "/courses",
  run(async (req, res) => {
    res.json(
      await prisma.capacitacion.findMany({
        select: {
          id: true,
          titulo: true,
          activo: true,
          modules: { select: { id: true } },
        },
        orderBy: { orden: "asc" },
      }),
    );
  }),
);

router.post(
  "/enrollments",
  run(async (req, res) => {
    const userId = Number(req.body?.userId);
    const courseId = Number(req.body?.courseId);
    if (!Number.isInteger(userId) || !Number.isInteger(courseId)) {
      return res.status(400).json({ error: "Elegí estudiante y curso." });
    }
    const [user, course] = await Promise.all([
      prisma.portalUser.findUnique({ where: { id: userId } }),
      prisma.capacitacion.findUnique({ where: { id: courseId } }),
    ]);
    if (user?.role !== "STUDENT" || !course)
      return res.status(400).json({ error: "Estudiante o curso inválido." });
    const enrollment = await prisma.courseEnrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId },
      update: {},
    });
    res.status(201).json(enrollment);
  }),
);

router.put(
  "/enrollments/:id",
  run(async (req, res) => {
    const id = Number(req.params.id);
    const progress = Number(req.body?.progress);
    if (
      !Number.isInteger(id) ||
      !Number.isInteger(progress) ||
      progress < 0 ||
      progress > 100
    ) {
      return res
        .status(400)
        .json({ error: "El avance debe estar entre 0 y 100." });
    }
    res.json(
      await prisma.courseEnrollment.update({
        where: { id },
        data: { progress },
      }),
    );
  }),
);

router.delete(
  "/enrollments/:id",
  run(async (req, res) => {
    await prisma.courseEnrollment.delete({
      where: { id: Number(req.params.id) },
    });
    res.json({ ok: true });
  }),
);

router.get(
  "/courses/:id/modules",
  run(async (req, res) => {
    const courseId = Number(req.params.id);
    if (!Number.isInteger(courseId))
      return res.status(400).json({ error: "Curso inválido." });
    res.json(
      await prisma.courseModule.findMany({
        where: { courseId },
        include: {
          resources: {
            select: {
              id: true,
              title: true,
              filename: true,
              size: true,
              mimeType: true,
            },
          },
        },
        orderBy: [{ order: "asc" }, { startsAt: "asc" }],
      }),
    );
  }),
);

router.post(
  "/courses/:id/modules",
  run(async (req, res) => {
    const courseId = Number(req.params.id);
    const title = String(req.body?.title || "").trim();
    const description = String(req.body?.description || "").trim();
    const meetingUrl = String(req.body?.meetingUrl || "").trim();
    const startsAt = req.body?.startsAt ? new Date(req.body.startsAt) : null;
    const order = Number(req.body?.order || 0);
    if (
      !Number.isInteger(courseId) ||
      title.length < 3 ||
      title.length > 140 ||
      description.length > 1000 ||
      !validMeetingUrl(meetingUrl) ||
      (startsAt && Number.isNaN(startsAt.valueOf())) ||
      !Number.isInteger(order)
    ) {
      return res
        .status(400)
        .json({ error: "Revisá el título, fecha y enlace HTTPS de la clase." });
    }
    res.status(201).json(
      await prisma.courseModule.create({
        data: {
          courseId,
          title,
          description,
          meetingUrl: meetingUrl || null,
          startsAt,
          order,
        },
      }),
    );
  }),
);

router.put(
  "/modules/:id",
  run(async (req, res) => {
    const id = Number(req.params.id);
    const title = String(req.body?.title || "").trim();
    const description = String(req.body?.description || "").trim();
    const meetingUrl = String(req.body?.meetingUrl || "").trim();
    const startsAt = req.body?.startsAt ? new Date(req.body.startsAt) : null;
    const order = Number(req.body?.order || 0);
    if (
      !Number.isInteger(id) ||
      title.length < 3 ||
      title.length > 140 ||
      description.length > 1000 ||
      !validMeetingUrl(meetingUrl) ||
      (startsAt && Number.isNaN(startsAt.valueOf())) ||
      !Number.isInteger(order)
    ) {
      return res.status(400).json({ error: "Datos de módulo inválidos." });
    }
    res.json(
      await prisma.courseModule.update({
        where: { id },
        data: {
          title,
          description,
          meetingUrl: meetingUrl || null,
          startsAt,
          order,
        },
      }),
    );
  }),
);

router.delete(
  "/modules/:id",
  run(async (req, res) => {
    await prisma.courseModule.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  }),
);

router.post(
  "/modules/:id/resources",
  uploadOne,
  run(async (req, res) => {
    const moduleId = Number(req.params.id);
    const title = String(req.body?.title || "").trim();
    if (
      !Number.isInteger(moduleId) ||
      title.length < 3 ||
      title.length > 140 ||
      !isAllowedFile(req.file)
    ) {
      return res
        .status(400)
        .json({
          error: "Ingresá un título y adjuntá PDF, JPG o PNG de hasta 10 MB.",
        });
    }
    res.status(201).json(
      await prisma.courseResource.create({
        data: {
          moduleId,
          title,
          filename: documentFilename("RESOURCE", req.file.originalname),
          mimeType: req.file.mimetype,
          size: req.file.size,
          encryptedData: encryptFile(req.file.buffer),
        },
        select: {
          id: true,
          title: true,
          filename: true,
          size: true,
          mimeType: true,
        },
      }),
    );
  }),
);

router.get(
  "/resources/:id",
  run(async (req, res) => {
    const resource = await prisma.courseResource.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!resource)
      return res.status(404).json({ error: "Archivo no encontrado." });
    sendPrivateFile(res, resource);
  }),
);

router.delete(
  "/resources/:id",
  run(async (req, res) => {
    await prisma.courseResource.delete({
      where: { id: Number(req.params.id) },
    });
    res.json({ ok: true });
  }),
);

router.get(
  "/cases",
  run(async (req, res) => {
    const cases = await prisma.clientCase.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        organization: { select: { id: true, name: true } },
        _count: { select: { documents: true, comments: true } },
        comments: {
          where: { authorRole: "CLIENT", readByKadimaAt: null },
          select: { id: true },
        },
      },
    });
    res.json(
      cases.map(({ comments, ...record }) => ({
        ...record,
        subject: decryptText(record.subject),
        patientLabel: decryptText(record.patientLabel),
        unreadMessages: comments.length,
      })),
    );
  }),
);

router.get(
  "/cases/:id",
  run(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id))
      return res.status(400).json({ error: "Caso inválido." });
    const record = await prisma.clientCase.findUnique({
      where: { id },
      include: {
        organization: { select: { id: true, name: true } },
        documents: { select: documentSelect, orderBy: { createdAt: "asc" } },
        comments: {
          select: {
            id: true,
            authorName: true,
            authorRole: true,
            body: true,
            readByClientAt: true,
            readByKadimaAt: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!record) return res.status(404).json({ error: "Caso no encontrado." });
    const unreadMessages = record.comments.filter(
      (comment) =>
        comment.authorRole === "CLIENT" && !comment.readByKadimaAt,
    ).length;
    if (req.query.markRead === "1" && unreadMessages) {
      const readAt = new Date();
      await prisma.caseComment.updateMany({
        where: {
          caseId: id,
          authorRole: "CLIENT",
          readByKadimaAt: null,
        },
        data: { readByKadimaAt: readAt },
      });
      record.comments = record.comments.map((comment) =>
        comment.authorRole === "CLIENT"
          ? { ...comment, readByKadimaAt: readAt }
          : comment,
      );
    }
    res.json({
      ...record,
      subject: decryptText(record.subject),
      patientLabel: decryptText(record.patientLabel),
      documents: record.documents.map((document) => ({
        ...document,
        amount: document.amount == null ? null : Number(document.amount),
      })),
      comments: record.comments.map((comment) => ({
        ...comment,
        body: decryptText(comment.body),
      })),
      unreadMessages: req.query.markRead === "1" ? 0 : unreadMessages,
    });
  }),
);

router.post(
  "/cases/:id/quotes",
  uploadOne,
  run(async (req, res) => {
    const caseId = Number(req.params.id);
    const vendor = String(req.body?.vendor || "").trim();
    const amount = Number(req.body?.amount);
    if (
      !Number.isInteger(caseId) ||
      vendor.length < 2 ||
      vendor.length > 120 ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > 9999999999 ||
      !isAllowedFile(req.file)
    ) {
      return res
        .status(400)
        .json({
          error:
            "Ingresá proveedor, importe positivo y cotización en PDF, JPG o PNG.",
        });
    }
    const record = await prisma.clientCase.findUnique({
      where: { id: caseId },
      include: {
        _count: { select: { documents: { where: { kind: "QUOTE" } } } },
      },
    });
    if (!record) return res.status(404).json({ error: "Caso no encontrado." });
    if (
      !["REQUESTED", "QUOTING"].includes(record.status) ||
      record._count.documents >= 3
    ) {
      return res
        .status(409)
        .json({
          error: "El caso admite hasta tres cotizaciones antes de publicarlas.",
        });
    }
    const quote = await prisma.$transaction(async (tx) => {
      const created = await tx.caseDocument.create({
        data: {
          caseId,
          kind: "QUOTE",
          vendor,
          amount,
          filename: documentFilename("QUOTE", req.file.originalname),
          mimeType: req.file.mimetype,
          size: req.file.size,
          encryptedData: encryptFile(req.file.buffer),
          uploadedBy: "Kadima",
        },
        select: documentSelect,
      });
      await tx.clientCase.update({
        where: { id: caseId },
        data: { status: "QUOTING" },
      });
      return created;
    });
    res.status(201).json({ ...quote, amount: Number(quote.amount) });
  }),
);

router.delete(
  "/quotes/:id",
  run(async (req, res) => {
    const id = Number(req.params.id);
    const quote = await prisma.caseDocument.findUnique({
      where: { id },
      include: { case: true },
    });
    if (!quote || quote.kind !== "QUOTE")
      return res.status(404).json({ error: "Cotización no encontrada." });
    if (!["REQUESTED", "QUOTING"].includes(quote.case.status)) {
      return res
        .status(409)
        .json({ error: "No se puede quitar una cotización ya publicada." });
    }
    await prisma.caseDocument.delete({ where: { id } });
    res.json({ ok: true });
  }),
);

router.post(
  "/cases/:id/publish",
  run(async (req, res) => {
    const id = Number(req.params.id);
    const record = await prisma.clientCase.findUnique({
      where: { id },
      include: {
        _count: { select: { documents: { where: { kind: "QUOTE" } } } },
      },
    });
    if (!record) return res.status(404).json({ error: "Caso no encontrado." });
    if (
      !["REQUESTED", "QUOTING"].includes(record.status) ||
      record._count.documents !== 3
    ) {
      return res
        .status(409)
        .json({
          error: "Cargá exactamente tres cotizaciones antes de publicarlas.",
        });
    }
    await prisma.clientCase.update({
      where: { id },
      data: { status: "QUOTES_READY" },
    });
    res.json({ ok: true });
  }),
);

router.post(
  "/cases/:id/comments",
  run(async (req, res) => {
    const caseId = Number(req.params.id);
    const body = String(req.body?.body || "").trim();
    if (!Number.isInteger(caseId) || body.length < 2 || body.length > 2000) {
      return res
        .status(400)
        .json({ error: "El comentario debe tener entre 2 y 2000 caracteres." });
    }
    const record = await prisma.clientCase.findUnique({
      where: { id: caseId },
    });
    if (!record) return res.status(404).json({ error: "Caso no encontrado." });
    await prisma.caseComment.create({
      data: {
        caseId,
        authorName: req.admin.username,
        authorRole: "KADIMA",
        body: encryptText(body),
        readByKadimaAt: new Date(),
      },
    });
    await prisma.clientCase.update({
      where: { id: caseId },
      data: { updatedAt: new Date() },
    });
    res.status(201).json({ ok: true });
  }),
);

router.put(
  "/cases/:id/close",
  run(async (req, res) => {
    const id = Number(req.params.id);
    const record = await prisma.clientCase.findUnique({ where: { id } });
    if (!record) return res.status(404).json({ error: "Caso no encontrado." });
    if (record.status !== "AUTHORIZED")
      return res
        .status(409)
        .json({
          error: "El caso se cierra después de recibir la autorización.",
        });
    res.json(
      await prisma.clientCase.update({
        where: { id },
        data: { status: "CLOSED" },
        select: { id: true, status: true },
      }),
    );
  }),
);

router.get(
  "/documents/:id",
  run(async (req, res) => {
    const document = await prisma.caseDocument.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!document)
      return res.status(404).json({ error: "Archivo no encontrado." });
    sendPrivateFile(res, document);
  }),
);

router.use((error, req, res, next) => {
  if (error.code === "P2002")
    return res.status(409).json({ error: "El email ya está registrado." });
  console.error("Admin portals request failed:", error);
  res.status(500).json({ error: "No se pudo completar la operación." });
});

module.exports = router;
