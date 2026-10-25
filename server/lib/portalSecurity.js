const crypto = require("crypto");
const path = require("path");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { JWT_SECRET } = require("../middleware/auth");

const prisma = new PrismaClient();
const COOKIE_NAME = "kadima_portal_session";
const sessionAge = 8 * 60 * 60 * 1000;
const documentKey = process.env.PORTAL_DOCUMENT_KEY;
const portalConfigured = Boolean(
  process.env.DATABASE_URL &&
    JWT_SECRET &&
    documentKey &&
    /^[a-f0-9]{64}$/i.test(documentKey),
);

function unavailable(req, res, next) {
  if (!portalConfigured) {
    return res
      .status(503)
      .json({
        error:
          "Los portales privados todavía no están configurados en esta instancia.",
      });
  }
  next();
}

function readCookie(req) {
  const cookie = (req.headers.cookie || "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(COOKIE_NAME + "="));
  return cookie
    ? decodeURIComponent(cookie.slice(COOKIE_NAME.length + 1))
    : null;
}

async function portalAuth(req, res, next) {
  const token = readCookie(req);
  if (!token)
    return res.status(401).json({ error: "Iniciá sesión para continuar." });
  try {
    const claims = jwt.verify(token, JWT_SECRET);
    if (claims.scope !== "portal" || !Number.isInteger(claims.sub)) {
      return res.status(401).json({ error: "Sesión inválida." });
    }
    const user = await prisma.portalUser.findUnique({
      where: { id: claims.sub },
      include: {
        organization: { select: { id: true, name: true, active: true } },
      },
    });
    if (
      !user ||
      !user.active ||
      (user.role === "CLIENT" && !user.organization?.active)
    ) {
      return res.status(401).json({ error: "La cuenta no está disponible." });
    }
    req.portalUser = user;
    next();
  } catch {
    return res
      .status(401)
      .json({ error: "La sesión expiró. Ingresá nuevamente." });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.portalUser?.role !== role)
      return res.status(403).json({ error: "No tenés acceso a esta sección." });
    next();
  };
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/portal",
    maxAge: sessionAge,
  };
}

function safeFilename(name) {
  return path
    .basename(name || "documento")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 100);
}

function isAllowedFile(file) {
  if (!file || file.size > 10 * 1024 * 1024) return false;
  const ext = path.extname(file.originalname).toLowerCase();
  const data = file.buffer;
  if (ext === ".pdf" && file.mimetype === "application/pdf") {
    return data.subarray(0, 5).toString() === "%PDF-";
  }
  if ([".jpg", ".jpeg"].includes(ext) && file.mimetype === "image/jpeg") {
    return data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
  }
  if (ext === ".png" && file.mimetype === "image/png") {
    return data.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex"));
  }
  return false;
}

function encryptFile(buffer) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    Buffer.from(documentKey, "hex"),
    iv,
  );
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]);
}

function decryptFile(buffer) {
  const value = Buffer.from(buffer);
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    Buffer.from(documentKey, "hex"),
    value.subarray(0, 12),
  );
  decipher.setAuthTag(value.subarray(12, 28));
  return Buffer.concat([decipher.update(value.subarray(28)), decipher.final()]);
}

function encryptText(value) {
  return "enc:" + encryptFile(Buffer.from(value, "utf8")).toString("base64");
}

function decryptText(value) {
  if (!value?.startsWith("enc:")) return value;
  return decryptFile(Buffer.from(value.slice(4), "base64")).toString("utf8");
}

function documentFilename(kind, originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const labels = {
    MEDICAL_ORDER: "pedido-medico",
    QUOTE: "cotizacion",
    AUTHORIZATION: "autorizacion",
    RESOURCE: "bibliografia",
  };
  return (
    (labels[kind] || "documento") +
    "-" +
    crypto.randomBytes(4).toString("hex") +
    ext
  );
}

function sendPrivateFile(res, file) {
  const filename = safeFilename(file.filename);
  res.set({
    "Content-Type": file.mimeType,
    "Content-Disposition": 'attachment; filename="' + filename + '"',
    "Content-Length": file.size,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  res.send(decryptFile(file.encryptedData));
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organization: user.organization
      ? { id: user.organization.id, name: user.organization.name }
      : null,
  };
}

module.exports = {
  prisma,
  COOKIE_NAME,
  portalConfigured,
  unavailable,
  portalAuth,
  requireRole,
  sessionCookieOptions,
  isAllowedFile,
  safeFilename,
  encryptFile,
  encryptText,
  decryptText,
  documentFilename,
  sendPrivateFile,
  publicUser,
};
