import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GmailRequest = {
  action: "send";
  to: string;
  subject: string;
  body: string;
};

function encodeMessage({ to, subject, body }: Omit<GmailRequest, "action">) {
  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=UTF-8",
    "MIME-Version: 1.0",
    "",
    body,
  ].join("\r\n");

  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function hasGmailSendScope(scope?: string) {
  return Boolean(scope?.split(" ").includes("https://www.googleapis.com/auth/gmail.send"));
}

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const connected = Boolean(token?.googleAccessToken && hasGmailSendScope(token.googleScope));

  return NextResponse.json({
    ok: true,
    connected,
    email: connected ? token?.email ?? null : null,
  });
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.googleAccessToken) {
    return NextResponse.json(
      { ok: false, error: "Gmail is not connected. Sign in with Google and grant Gmail access first." },
      { status: 401 }
    );
  }

  if (!hasGmailSendScope(token.googleScope)) {
    return NextResponse.json(
      { ok: false, error: "Gmail send permission is missing. Reconnect Google to grant Gmail access." },
      { status: 403 }
    );
  }

  try {
    const payload = (await req.json()) as Partial<GmailRequest>;
    if (payload.action !== "send" || !payload.to || !payload.subject || !payload.body) {
      return NextResponse.json(
        { ok: false, error: "Send requires action, to, subject and body." },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.googleAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          raw: encodeMessage({
            to: payload.to,
            subject: payload.subject,
            body: payload.body,
          }),
        }),
      }
    );

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("[gmail] send failed", response.status, data);
      return NextResponse.json(
        {
          ok: false,
          error:
            response.status === 401
              ? "Google rejected the access token. Please sign in with Google again."
              : "Google rejected the Gmail request. Check the granted Gmail permission.",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({ ok: true, messageId: data.id ?? null });
  } catch (error) {
    console.error("[gmail] unexpected error", error);
    return NextResponse.json({ ok: false, error: "Gmail action failed." }, { status: 500 });
  }
}
