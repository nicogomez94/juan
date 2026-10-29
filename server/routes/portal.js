const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { JWT_SECRET } = require("../middleware/auth");
const {
  prisma,
  COOKIE_NAME,
  portalConfigured,
  unavailable,
  portalAuth,
  requireRole,
  sessionCookieOptions,
  isAllowedFile,
  encryptFile,
  encryptText,
  decryptText,
  documentFilename,
  sendPrivateFile,
  publicUser,
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
const attempts = new Map();
const fileSelect = {
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

function serializeCase(record) {
  return {
    ...record,
    subject: decryptText(record.subject),
    patientLabel: decryptText(record.patientLabel),
    comments: record.comments?.map((comment) => ({
      ...comment,
      body: decryptText(comment.body),
    })),
    documents: record.documents?.map((document) => ({
      ...document,
      amount: document.amount == null ? null : Number(document.amount),
    })),
  };
}

function clientCase(req, id, include = {}) {
  return prisma.clientCase.findFirst({
    where: { id, organizationId: req.portalUser.organizationId },
    include,
  });
}

function clean(value, max = 160) {
  return String(value || "").trim().slice(0, max);
}

function setPortalSession(res, user) {
  const token = jwt.sign(
    { sub: user.id, role: user.role, scope: "portal" },
    JWT_SECRET,
    { expiresIn: "8h" },
  );
  res.cookie(COOKIE_NAME, token, sessionCookieOptions());
}

router.get("/status", (req, res) => res.json({ available: portalConfigured }));
router.use(unavailable);

router.use((req, res, next) => {
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const origin = req.get("origin");
    const allowed = new Set(
      [
        ...(process.env.NODE_ENV === "production"
          ? []
          : ["http://localhost:5173", "http://localhost:4173"]),
        process.env.FRONTEND_URL,
      ].filter(Boolean),
    );
    let sameOrigin = false;
    try {
      sameOrigin = Boolean(origin && new URL(origin).host === req.get("host"));
    } catch {
      return res.status(403).json({ error: "Origen no permitido." });
    }
    if (origin && !sameOrigin && !allowed.has(origin)) {
      return res.status(403).json({ error: "Origen no permitido." });
    }
  }
  next();
});

router.post(
  "/register-client",
  run(async (req, res) => {
    const organizationName = clean(req.body?.organizationName, 140);
    const taxId = clean(req.body?.taxId, 20).replace(/[^0-9-]/g, "");
    const organizationPhone = clean(req.body?.organizationPhone, 40);
    const address = clean(req.body?.address, 180);
    const name = clean(req.body?.name, 120);
    const position = clean(req.body?.position, 80);
    const phone = clean(req.body?.phone, 40);
    const email = clean(req.body?.email, 180).toLowerCase();
    const password = String(req.body?.password || "");
    if (
      organizationName.length < 3 ||
      taxId.length < 8 ||
      name.length < 3 ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      password.length < 10
    ) {
      return res.status(400).json({
        error: "Completá los datos de la institución y usá una contraseña de al menos 10 caracteres.",
      });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    try {
      const user = await prisma.$transaction(async (tx) => {
        const organization = await tx.clientOrganization.create({
          data: {
            name: organizationName,
            taxId,
            phone: organizationPhone || null,
            address: address || null,
          },
        });
        return tx.portalUser.create({
          data: {
            name,
            email,
            phone: phone || null,
            position: position || null,
            passwordHash,
            role: "CLIENT",
            organizationId: organization.id,
          },
          include: { organization: true },
        });
      });
      setPortalSession(res, user);
      res.status(201).json({ user: publicUser(user) });
    } catch (error) {
      if (error?.code === "P2002") {
        return res.status(409).json({
          error: "Ya existe una cuenta con ese correo o una institución con ese CUIT.",
        });
      }
      throw error;
    }
  }),
);

router.post(
  "/login",
  run(async (req, res) => {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || "");
    if (!email || !password)
      return res.status(400).json({ error: "Ingresá usuario y contraseña." });
    const attemptKey = req.ip + ":" + email;
    const current = attempts.get(attemptKey);
    if (current?.count >= 8 && current.until > Date.now()) {
      return res
        .status(429)
        .json({ error: "Demasiados intentos. Probá más tarde." });
    }
    const user = await prisma.portalUser.findUnique({
      where: { email },
      include: { organization: true },
    });
    const valid =
      user &&
      user.active &&
      (user.role !== "CLIENT" || user.organization?.active) &&
      (await bcrypt.compare(password, user.passwordHash));
    if (!valid) {
      const count = current?.until > Date.now() ? current.count + 1 : 1;
      attempts.set(attemptKey, { count, until: Date.now() + 15 * 60 * 1000 });
      return res
        .status(401)
        .json({ error: "Usuario o contraseña incorrectos." });
    }
    attempts.delete(attemptKey);
    setPortalSession(res, user);
    res.json({ user: publicUser(user) });
  }),
);

router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    ...sessionCookieOptions(),
    maxAge: undefined,
  });
  res.json({ ok: true });
});

router.get("/me", portalAuth, (req, res) =>
  res.json({ user: publicUser(req.portalUser) }),
);

router.put(
  "/me",
  portalAuth,
  run(async (req, res) => {
    const name = clean(req.body?.name, 120);
    const phone = clean(req.body?.phone, 40);
    const position = clean(req.body?.position, 80);
    const organizationName = clean(req.body?.organizationName, 140);
    const organizationPhone = clean(req.body?.organizationPhone, 40);
    const address = clean(req.body?.address, 180);
    if (
      name.length < 3 ||
      (req.portalUser.role === "CLIENT" && organizationName.length < 3)
    ) {
      return res.status(400).json({ error: "Revisá el nombre y la institución." });
    }
    await prisma.$transaction(async (tx) => {
      await tx.portalUser.update({
        where: { id: req.portalUser.id },
        data: { name, phone: phone || null, position: position || null },
      });
      if (req.portalUser.role === "CLIENT" && req.portalUser.organizationId) {
        await tx.clientOrganization.update({
          where: { id: req.portalUser.organizationId },
          data: {
            name: organizationName,
            phone: organizationPhone || null,
            address: address || null,
          },
        });
      }
    });
    const user = await prisma.portalUser.findUnique({
      where: { id: req.portalUser.id },
      include: { organization: true },
    });
    res.json({ user: publicUser(user) });
  }),
);

router.get(
  "/student/dashboard",
  portalAuth,
  requireRole("STUDENT"),
  run(async (req, res) => {
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { userId: req.portalUser.id },
      include: {
        course: {
          include: {
            modules: {
              orderBy: [{ order: "asc" }, { startsAt: "asc" }],
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
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({
      user: publicUser(req.portalUser),
      enrollments: enrollments.map((item) => ({
        id: item.id,
        progress: item.progress,
        course: {
          id: item.course.id,
          title: item.course.titulo,
          description: item.course.descripcion,
          duration: item.course.duracion,
          modules: item.course.modules,
        },
      })),
    });
  }),
);

router.get(
  "/student/resources/:id",
  portalAuth,
  requireRole("STUDENT"),
  run(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id))
      return res.status(400).json({ error: "Archivo inválido." });
    const resource = await prisma.courseResource.findUnique({
      where: { id },
      include: { module: { select: { courseId: true } } },
    });
    if (!resource)
      return res.status(404).json({ error: "Archivo no encontrado." });
    const enrolled = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: req.portalUser.id,
          courseId: resource.module.courseId,
        },
      },
      select: { id: true },
    });
    if (!enrolled)
      return res.status(404).json({ error: "Archivo no encontrado." });
    sendPrivateFile(res, resource);
  }),
);

router.get(
  "/client/cases",
  portalAuth,
  requireRole("CLIENT"),
  run(async (req, res) => {
    if (!req.portalUser.organizationId)
      return res
        .status(403)
        .json({ error: "Cuenta sin institución asignada." });
    const cases = await prisma.clientCase.findMany({
      where: { organizationId: req.portalUser.organizationId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        subject: true,
        patientLabel: true,
        type: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { documents: true, comments: true } },
      },
    });
    res.json(cases.map(serializeCase));
  }),
);

router.post(
  "/client/cases",
  portalAuth,
  requireRole("CLIENT"),
  uploadOne,
  run(async (req, res) => {
    const type = req.body.type;
    const subject = String(req.body.subject || "").trim();
    const patientLabel = String(req.body.patientLabel || "").trim();
    const comment = String(req.body.comment || "").trim();
    if (
      !req.portalUser.organizationId ||
      !["MEDICATION", "PROSTHESIS"].includes(type) ||
      subject.length < 4 ||
      subject.length > 160 ||
      patientLabel.length < 2 ||
      patientLabel.length > 100 ||
      comment.length > 2000 ||
      !isAllowedFile(req.file)
    ) {
      return res
        .status(400)
        .json({
          error:
            "Completá el caso y adjuntá un pedido médico en PDF, JPG o PNG (hasta 10 MB).",
        });
    }
    const record = await prisma.clientCase.create({
      data: {
        organizationId: req.portalUser.organizationId,
        createdById: req.portalUser.id,
        type,
        subject: encryptText(subject),
        patientLabel: encryptText(patientLabel),
        documents: {
          create: {
            kind: "MEDICAL_ORDER",
            filename: documentFilename("MEDICAL_ORDER", req.file.originalname),
            mimeType: req.file.mimetype,
            size: req.file.size,
            encryptedData: encryptFile(req.file.buffer),
            uploadedBy: req.portalUser.name,
          },
        },
        ...(comment
          ? {
              comments: {
                create: {
                  authorId: req.portalUser.id,
                  authorName: req.portalUser.name,
                  authorRole: "CLIENT",
                  body: encryptText(comment),
                },
              },
            }
          : {}),
      },
    });
    res.status(201).json({ id: record.id });
  }),
);

router.get(
  "/client/cases/:id",
  portalAuth,
  requireRole("CLIENT"),
  run(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id))
      return res.status(400).json({ error: "Caso inválido." });
    const record = await clientCase(req, id, {
      documents: { select: fileSelect, orderBy: { createdAt: "asc" } },
      comments: {
        select: {
          id: true,
          authorName: true,
          authorRole: true,
          body: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
      organization: { select: { id: true, name: true } },
    });
    if (!record) return res.status(404).json({ error: "Caso no encontrado." });
    if (!["QUOTES_READY", "AUTHORIZED", "CLOSED"].includes(record.status)) {
      record.documents = record.documents.filter(
        (document) => document.kind !== "QUOTE",
      );
    }
    res.json(serializeCase(record));
  }),
);

router.post(
  "/client/cases/:id/comments",
  portalAuth,
  requireRole("CLIENT"),
  run(async (req, res) => {
    const id = Number(req.params.id);
    const body = String(req.body?.body || "").trim();
    if (!Number.isInteger(id) || body.length < 2 || body.length > 2000) {
      return res
        .status(400)
        .json({ error: "El comentario debe tener entre 2 y 2000 caracteres." });
    }
    const record = await clientCase(req, id);
    if (!record) return res.status(404).json({ error: "Caso no encontrado." });
    await prisma.caseComment.create({
      data: {
        caseId: id,
        authorId: req.portalUser.id,
        authorName: req.portalUser.name,
        authorRole: "CLIENT",
        body: encryptText(body),
      },
    });
    await prisma.clientCase.update({
      where: { id },
      data: { updatedAt: new Date() },
    });
    res.status(201).json({ ok: true });
  }),
);

router.post(
  "/client/cases/:id/authorization",
  portalAuth,
  requireRole("CLIENT"),
  uploadOne,
  run(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || !isAllowedFile(req.file)) {
      return res
        .status(400)
        .json({
          error:
            "Adjuntá la autorización firmada en PDF, JPG o PNG (hasta 10 MB).",
        });
    }
    const record = await clientCase(req, id);
    if (!record) return res.status(404).json({ error: "Caso no encontrado." });
    if (record.status !== "QUOTES_READY") {
      return res
        .status(409)
        .json({
          error:
            "La autorización se carga después de recibir las tres cotizaciones.",
        });
    }
    await prisma.$transaction(async (tx) => {
      await tx.caseDocument.create({
        data: {
          caseId: id,
          kind: "AUTHORIZATION",
          filename: documentFilename("AUTHORIZATION", req.file.originalname),
          mimeType: req.file.mimetype,
          size: req.file.size,
          encryptedData: encryptFile(req.file.buffer),
          uploadedBy: req.portalUser.name,
        },
      });
      await tx.clientCase.update({
        where: { id },
        data: { status: "AUTHORIZED" },
      });
    });
    res.status(201).json({ ok: true });
  }),
);

router.get(
  "/client/documents/:id",
  portalAuth,
  requireRole("CLIENT"),
  run(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id))
      return res.status(400).json({ error: "Archivo inválido." });
    const document = await prisma.caseDocument.findFirst({
      where: { id, case: { organizationId: req.portalUser.organizationId } },
      include: { case: { select: { status: true } } },
    });
    if (
      !document ||
      (document.kind === "QUOTE" &&
        !["QUOTES_READY", "AUTHORIZED", "CLOSED"].includes(
          document.case.status,
        ))
    ) {
      return res.status(404).json({ error: "Archivo no encontrado." });
    }
    sendPrivateFile(res, document);
  }),
);

router.use((error, req, res, next) => {
  console.error("Portal request failed:", error);
  res.status(500).json({ error: "No se pudo completar la operación." });
});

module.exports = router;
