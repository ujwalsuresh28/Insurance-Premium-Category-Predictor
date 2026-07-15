const API_BASE = import.meta.env.VITE_API_URL || "/api";

function getToken() {
  return localStorage.getItem("token");
}

function setToken(token) {
  localStorage.setItem("token", token);
}

function clearToken() {
  localStorage.removeItem("token");
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.detail || data.message || "Request failed";
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  return data;
}

export const api = {
  getToken,
  setToken,
  clearToken,
  register: (payload) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request("/auth/me"),
  predict: (payload) =>
    request("/predict", { method: "POST", body: JSON.stringify(payload) }),
  history: () => request("/history"),
};
