const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE ||
  runtimeApiBase()
).replace(/\/$/, "");

function runtimeApiBase() {
  const isLocalFrontend =
    window.location.protocol === "file:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  return isLocalFrontend ? "http://127.0.0.1:8000" : "https://api.hirescoreai.com";
}

export async function apiGet(path) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: authHeaders()
  });
  if (!response.ok) throw await apiError(response);
  return response.json();
}

export async function apiPost(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers: authHeaders(),
    body: JSON.stringify(body)
  });
  if (!response.ok) throw await apiError(response);
  return response.json();
}

export async function apiPatch(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    credentials: "include",
    headers: authHeaders(),
    body: JSON.stringify(body)
  });
  if (!response.ok) throw await apiError(response);
  return response.json();
}

export async function apiUpload(path, formData) {
  const headers = authHeaders();
  delete headers["Content-Type"];
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers,
    body: formData
  });
  if (!response.ok) throw await apiError(response);
  return response.json();
}

async function apiError(response) {
  const payload = await response.json().catch(() => ({}));
  const error = new Error(payload.detail || payload.message || "Request failed");
  error.status = response.status;
  error.payload = payload;
  return error;
}

export function authHeaders() {
  const token = localStorage.getItem("token");
  const csrf = localStorage.getItem("csrf_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(csrf ? { "X-CSRF-Token": csrf } : {})
  };
}
