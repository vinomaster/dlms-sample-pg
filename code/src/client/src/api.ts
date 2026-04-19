/**
 * src/client/src/api.ts
 *
 * Typed API client for the DLMS Team Outing Planner.
 * All calls go through Axios; credentials (basic auth or session cookie)
 * are sent automatically via the `withCredentials` flag.
 */

import axios from "axios";

const BASE = process.env.REACT_APP_API_URL ?? "";

const client = axios.create({
  baseURL: BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TeamOuting {
  _id: string;
  _state: string;
  _createdAt?: string;
  _updatedAt?: string;
  eventName: string;
  eventDate: string;
  location: string;
  estimatedCost: number;
  maxAttendees: number;
  description: string;
  planningTopics: string;
  owner?: { email: string; name: string };
  reviewers?: { email: string; name: string }[];
}

export interface DocList<T = any> {
  count: number;
  items: T[];
}

export interface UserGroup {
  id: string;
  deletable?: boolean;
  members: { email: string; name: string; department: string; title: string; employeeNumber: string }[];
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export function setBasicAuth(uid: string, pwd: string) {
  client.defaults.headers.common["Authorization"] =
    "Basic " + btoa(`${uid}:${pwd}`);
}

export function clearAuth() {
  delete client.defaults.headers.common["Authorization"];
}

// ─── Documents ────────────────────────────────────────────────────────────────

export const docs = {
  list: (match?: any): Promise<DocList<TeamOuting>> =>
    client
      .get("/api/docs/teamOutings", { params: match ? { match: JSON.stringify(match) } : {} })
      .then((r) => r.data),

  get: (id: string): Promise<TeamOuting> =>
    client.get(`/api/docs/teamOutings/${id}`).then((r) => r.data),

  create: (doc: Partial<TeamOuting>): Promise<TeamOuting> =>
    client.post("/api/docs/teamOutings", doc).then((r) => r.data),

  update: (id: string, patch: Partial<TeamOuting>): Promise<TeamOuting> =>
    client.patch(`/api/docs/teamOutings/${id}`, patch).then((r) => r.data),

  delete: (id: string): Promise<TeamOuting> =>
    client.delete(`/api/docs/teamOutings/${id}`).then((r) => r.data),

  search: (q: string, filters?: any): Promise<DocList<TeamOuting>> =>
    client
      .get("/api/docs/teamOutings/search", {
        params: { q, ...(filters ? { filters: JSON.stringify(filters) } : {}) },
      })
      .then((r) => r.data),

  transition: (id: string, newState: string): Promise<TeamOuting> =>
    client.patch(`/api/docs/teamOutings/${id}`, { _state: newState }).then((r) => r.data),
};

// ─── Attachments ──────────────────────────────────────────────────────────────

export const attachments = {
  list: (docId: string) =>
    client.get(`/api/docs/teamOutings/${docId}/attachments`).then((r) => r.data),

  upload: (docId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return client.post(`/api/docs/teamOutings/${docId}/attachments`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },

  download: (docId: string, attId: string) =>
    client
      .get(`/api/docs/teamOutings/${docId}/attachments/${attId}`, { responseType: "blob" })
      .then((r) => r.data),

  delete: (docId: string, attId: string) =>
    client.delete(`/api/docs/teamOutings/${docId}/attachments/${attId}`).then((r) => r.data),
};

// ─── User groups ──────────────────────────────────────────────────────────────

export const userGroups = {
  list: (): Promise<DocList<UserGroup>> =>
    client.get("/api/user_groups").then((r) => r.data),

  get: (id: string): Promise<UserGroup> =>
    client.get(`/api/user_groups/${id}`).then((r) => r.data),

  update: (id: string, members: UserGroup["members"]): Promise<UserGroup> =>
    client.patch(`/api/user_groups/${id}`, { members }).then((r) => r.data),
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const admin = {
  health: () => client.get("/api/admin/health").then((r) => r.data),
  export: () => client.get("/api/admin/export").then((r) => r.data),
  import: (data: any) => client.post("/api/admin/import", data).then((r) => r.data),
  reset: (simpleInit = false) =>
    client.get("/api/admin/reset", { params: { simpleInit } }).then((r) => r.data),
  reindex: () => client.post("/api/admin/reindex").then((r) => r.data),
};

export default client;
