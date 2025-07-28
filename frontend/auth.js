export const API_BASE = "/api";

export function saveAuth({ token, role, name }) {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  localStorage.setItem("name", name || "");
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getRole() {
  return localStorage.getItem("role");
}

export function isLoggedIn() {
  return !!getToken();
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("name");
  window.location.href = "home.html";
}

export function requireRole(roleRequired) {
  const token = getToken();
  const role = getRole();
  if (!token || role !== roleRequired) {
    const target = encodeURIComponent(window.location.pathname.split("/").pop());
    window.location.href = `login.html?redirect=${target}`;
  }
}

export async function postJSON(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
}
