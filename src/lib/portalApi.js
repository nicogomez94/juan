const base = import.meta.env.VITE_API_URL || "";

export async function portalRequest(path, options = {}) {
  const response = await fetch(`${base}/api/portal${path}`, {
    credentials: "include",
    ...options,
    headers:
      options.body instanceof FormData
        ? options.headers
        : { "Content-Type": "application/json", ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(data.error || "No se pudo completar la operación.");
  return data;
}

export async function adminPortalRequest(path, options = {}) {
  const token = localStorage.getItem("kadima_admin_token");
  const response = await fetch(`${base}/api/admin/portals${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(data.error || "No se pudo completar la operación.");
  return data;
}

export async function downloadPrivate(path, admin = false) {
  const token = localStorage.getItem("kadima_admin_token");
  const response = await fetch(
    `${base}${admin ? "/api/admin/portals" : "/api/portal"}${path}`,
    {
      credentials: "include",
      headers: admin && token ? { Authorization: `Bearer ${token}` } : {},
    },
  );
  if (!response.ok) throw new Error("No se pudo descargar el archivo.");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download =
    response.headers
      .get("Content-Disposition")
      ?.match(/filename="([^"]+)"/)?.[1] || "documento";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
