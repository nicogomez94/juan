// Optional local-only demo data. Run with PORTAL_SEED_DEMO=true node prisma/seedPortals.js.
require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
  quiet: true,
});
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const {
  prisma,
  portalConfigured,
  encryptFile,
  encryptText,
} = require("../lib/portalSecurity");

async function main() {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.PORTAL_SEED_DEMO !== "true" ||
    !portalConfigured
  ) {
    throw new Error(
      "Esta carga de ejemplos requiere una base local y PORTAL_SEED_DEMO=true.",
    );
  }
  const course = await prisma.capacitacion.findFirst({
    orderBy: { orden: "asc" },
  });
  if (!course) throw new Error("Primero cargá el catálogo de capacitaciones.");
  const organization =
    (await prisma.clientOrganization.findFirst({
      where: { name: "Institución de Ejemplo · Demo" },
    })) ||
    (await prisma.clientOrganization.create({
      data: { name: "Institución de Ejemplo · Demo" },
    }));
  const passwordHash = await bcrypt.hash(
    crypto.randomBytes(24).toString("base64url"),
    12,
  );
  const student = await prisma.portalUser.upsert({
    where: { email: "estudiante-demo@kadima.invalid" },
    update: {},
    create: {
      email: "estudiante-demo@kadima.invalid",
      name: "Estudiante de ejemplo",
      role: "STUDENT",
      passwordHash,
    },
  });
  const client = await prisma.portalUser.upsert({
    where: { email: "cliente-demo@kadima.invalid" },
    update: {},
    create: {
      email: "cliente-demo@kadima.invalid",
      name: "Referente institucional de ejemplo",
      role: "CLIENT",
      passwordHash,
      organizationId: organization.id,
    },
  });
  await prisma.courseEnrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course.id } },
    update: {},
    create: { userId: student.id, courseId: course.id, progress: 35 },
  });
  const module =
    (await prisma.courseModule.findFirst({
      where: {
        courseId: course.id,
        title: "Introducción a la gestión institucional · Demo",
      },
    })) ||
    (await prisma.courseModule.create({
      data: {
        courseId: course.id,
        title: "Introducción a la gestión institucional · Demo",
        description: "Conceptos y documentación inicial.",
        startsAt: new Date("2026-11-03T20:00:00Z"),
        meetingUrl: "https://meet.google.com/",
        order: 0,
      },
    }));
  if (
    !(await prisma.courseResource.findFirst({
      where: { moduleId: module.id, title: "Guía de ejemplo" },
    }))
  ) {
    const file = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF");
    await prisma.courseResource.create({
      data: {
        moduleId: module.id,
        title: "Guía de ejemplo",
        filename: "guia-ejemplo.pdf",
        mimeType: "application/pdf",
        size: file.length,
        encryptedData: encryptFile(file),
      },
    });
  }
  if (
    !(await prisma.clientCase.findFirst({ where: { createdById: client.id } }))
  ) {
    const file = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF");
    await prisma.clientCase.create({
      data: {
        organizationId: organization.id,
        createdById: client.id,
        type: "MEDICATION",
        status: "QUOTES_READY",
        subject: encryptText("Solicitud de cobertura farmacéutica · Demo"),
        patientLabel: encryptText("Paciente ficticio 001"),
        documents: {
          create: [
            {
              kind: "MEDICAL_ORDER",
              filename: "pedido-medico-demo.pdf",
              mimeType: "application/pdf",
              size: file.length,
              encryptedData: encryptFile(file),
              uploadedBy: client.name,
            },
            ...[
              ["Proveedor A", 245000],
              ["Proveedor B", 262000],
              ["Proveedor C", 278000],
            ].map(([vendor, amount]) => ({
              kind: "QUOTE",
              filename: "cotizacion-demo.pdf",
              mimeType: "application/pdf",
              size: file.length,
              encryptedData: encryptFile(file),
              uploadedBy: "Kadima",
              vendor,
              amount,
            })),
          ],
        },
        comments: {
          create: [
            {
              authorId: client.id,
              authorName: client.name,
              authorRole: "CLIENT",
              body: encryptText(
                "Solicitamos tres alternativas para esta cobertura.",
              ),
            },
            {
              authorName: "Equipo Kadima",
              authorRole: "KADIMA",
              body: encryptText(
                "Las tres cotizaciones de ejemplo ya están disponibles.",
              ),
            },
          ],
        },
      },
    });
  }
  console.log("Datos ficticios de portales disponibles en la base local.");
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
