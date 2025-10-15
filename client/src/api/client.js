import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const api = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
});

// Helper for uniform response/error handling
async function http(path, opts = {}) {
  try {
    const res = await api({
      url: path,
      method: opts.method || "GET",
      data: opts.body ? JSON.parse(opts.body) : undefined,
      headers: opts.headers || {},
    });
    return res.data;
  } catch (err) {
    const msg = err.response
      ? `HTTP ${err.response.status}: ${JSON.stringify(err.response.data)}`
      : err.message;
    throw new Error(msg);
  }
}

// create/open by name + passphrase
export const createGroup = (name, accessCode) =>
  http("/api/groups", {
    method: "POST",
    body: JSON.stringify({ name, accessCode }),
  });

export const openGroup = (name, accessCode) =>
  http("/api/groups/open", {
    method: "POST",
    body: JSON.stringify({ name, accessCode }),
  });

// invite flows
export const openByInvite = (token) => http(`/api/groups/open-link/${token}`);
export const getInviteToken = (id) => http(`/api/groups/${id}/invite`);

// core
export const getGroup = (id) => http(`/api/groups/${id}`);
export const addMember = (id, name) =>
  http(`/api/groups/${id}/members`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
export const addExpense = (id, payload) =>
  http(`/api/groups/${id}/expenses`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const getSummary = (id) => http(`/api/groups/${id}/summary`);
export const getSettlements = (id) => http(`/api/groups/${id}/settlements`);
export const getLogs = (id) => http(`/api/groups/${id}/logs`);
export const getExpenses = (id) => http(`/api/groups/${id}/expenses`);
