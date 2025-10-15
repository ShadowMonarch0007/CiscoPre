const BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

async function http(path, opts = {}) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json", ...(opts.headers||{}) },
    ...opts,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

// new/updated
export const createGroup = (name, accessCode) =>
  http("/api/groups", { method: "POST", body: JSON.stringify({ name, accessCode }) });

export const openGroup = (name, accessCode) =>
  http("/api/groups/open", { method: "POST", body: JSON.stringify({ name, accessCode }) });

// existing
export const getGroup = (id) => http(`/api/groups/${id}`);
export const addMember = (id, name) =>
  http(`/api/groups/${id}/members`, { method: "POST", body: JSON.stringify({ name }) });
export const addExpense = (id, payload) =>
  http(`/api/groups/${id}/expenses`, { method: "POST", body: JSON.stringify(payload) });
export const getSummary = (id) => http(`/api/groups/${id}/summary`);
export const getSettlements = (id) => http(`/api/groups/${id}/settlements`);
