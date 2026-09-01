import { db } from "@/lib/db";

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";

type GmailConnection = { id: string; email: string | null; accessToken: string | null; refreshToken: string | null; scope: string | null; expiresAt: Date | null };

async function getConnection(userId: string): Promise<GmailConnection> {
  const connection = await db.googleConnection.findUnique({ where: { userId_provider: { userId, provider: "google" } } });
  if (!connection?.accessToken) throw new Error("Google Gmail is not connected.");
  const scopes = connection.scope ?? "";
  if (!scopes.includes("https://www.googleapis.com/auth/gmail.readonly")) throw new Error("Gmail read access has not been granted. Reconnect Google and approve Gmail access.");
  return connection;
}

async function refresh(connection: GmailConnection) {
  if (!connection.refreshToken || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return connection.accessToken!;
  if (connection.expiresAt && connection.expiresAt.getTime() > Date.now() + 60_000) return connection.accessToken!;
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, grant_type: "refresh_token", refresh_token: connection.refreshToken }) });
  const data = await response.json();
  if (!response.ok || !data.access_token) throw new Error("Google access token could not be refreshed. Reconnect Google.");
  await db.googleConnection.update({ where: { id: connection.id }, data: { accessToken: data.access_token, expiresAt: new Date(Date.now() + (Number(data.expires_in) || 3600) * 1000), scope: data.scope ?? connection.scope } });
  return data.access_token as string;
}

async function gmailFetch<T>(userId: string, path: string, init?: RequestInit): Promise<T> {
  const connection = await getConnection(userId);
  const accessToken = await refresh(connection);
  const response = await fetch(`${GMAIL_API}${path}`, { ...init, headers: { Authorization: `Bearer ${accessToken}`, ...(init?.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof data?.error?.message === "string" ? data.error.message : `Gmail API request failed (${response.status}).`);
  return data as T;
}

function encodeBase64Url(value: string) { return Buffer.from(value, "utf8").toString("base64url"); }

export async function listRecentMessages(userId: string, maxResults = 10) {
  const list = await gmailFetch<{ messages?: Array<{ id: string; threadId: string }>; resultSizeEstimate?: number }>(userId, `/messages?maxResults=${Math.min(Math.max(maxResults, 1), 25)}&q=newer_than:30d`);
  if (!list.messages?.length) return [];
  const messages = await Promise.all(list.messages.slice(0, maxResults).map((item) => gmailFetch<{ id: string; snippet?: string; payload?: { headers?: Array<{ name: string; value: string }> } }>(userId, `/messages/${item.id}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date`)));
  return messages.map((message) => {
    const headers = Object.fromEntries((message.payload?.headers ?? []).map((h) => [h.name.toLowerCase(), h.value]));
    return { id: message.id, from: headers.from ?? "", to: headers.to ?? "", subject: headers.subject ?? "", date: headers.date ?? "", snippet: message.snippet ?? "" };
  });
}

export async function createDraft(userId: string, to: string, subject: string, body: string) {
  const raw = [`To: ${to}`, `Subject: ${subject}`, "Content-Type: text/plain; charset=utf-8", "", body].join("\r\n");
  return gmailFetch<{ id: string; message?: { id?: string; threadId?: string } }>(userId, "/drafts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: { raw: encodeBase64Url(raw) } }) });
}

export async function sendMessage(userId: string, to: string, subject: string, body: string) {
  const raw = [`To: ${to}`, `Subject: ${subject}`, "Content-Type: text/plain; charset=utf-8", "", body].join("\r\n");
  return gmailFetch<{ id: string; threadId?: string }>(userId, "/messages/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ raw: encodeBase64Url(raw) }) });
}
