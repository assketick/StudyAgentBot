const API_URL = "/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  auth: {
    telegram: (data: object) =>
      request<{ access_token: string }>("/auth/telegram", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    me: () => request<{ id: number; tg_user_id: number; username: string; first_name: string; last_name: string }>("/auth/me"),
  },
  deadlines: {
    list: () => request<Deadline[]>("/deadlines"),
    patch: (id: number, body: { status: string }) =>
      request<Deadline>(`/deadlines/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    delete: (id: number) => request<void>(`/deadlines/${id}`, { method: "DELETE" }),
  },
  chats: {
    available: () => request<AvailableChat[]>("/chats/available"),
    subscriptions: () => request<Subscription[]>("/chats/subscriptions"),
    subscribe: (chat_id: number) =>
      request<Subscription>("/chats/subscriptions", { method: "POST", body: JSON.stringify({ chat_id }) }),
    unsubscribe: (chat_id: number) =>
      request<void>(`/chats/subscriptions/${chat_id}`, { method: "DELETE" }),
  },
  stats: {
    get: () => request<Stats>("/stats"),
  },
};

export interface Deadline {
  id: number;
  title: string;
  subject: string | null;
  due_at: string;
  status: string;
  source_text: string;
  source_chat_id: number | null;
  created_at: string;
}

export interface AvailableChat {
  chat_id: number;
  chat_title: string | null;
  subscribed: boolean;
}

export interface Subscription {
  id: number;
  chat_id: number;
  notify_new_deadlines: boolean;
  notify_updates: boolean;
  notify_daily_digest: boolean;
  created_at: string;
}

export interface Stats {
  total: number;
  active: number;
  done: number;
  overdue: number;
  by_subject: { subject: string; count: number }[];
}
