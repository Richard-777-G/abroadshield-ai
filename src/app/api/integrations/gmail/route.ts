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

type GoogleToken = {
  googleAccessToken?: string;
  googleRefreshToken?: string;
  googleScope?: string;
  googleAccessTokenExpires?: number;
};

function hasGmailSendScope(scope?: string) {
  return Boolean(scope?.split(" ").includes("https://www.googleapis.com/auth/gmail.send"));
}

async function getUsableGoogleAccessToken(req: NextRequest) {
  const token = (await getToken({ req, secret: process.env.NEXTAUTH_SECRET })) as (GoogleToken & { email?: string }) | null;
  if (!token?.googleAccessToken) return { token, accessToken: null };

  const expiresAt = token.googleAccessTokenExpires ?? 0;
  const stillValid = !expiresAt || Date.now() < expiresAt - 60_000;
  if (stillValid || !token.googleRefreshToken) {
    return { token, accessToken: token.googleAccessToken };
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return { token, accessToken: token.googleAccessToken };
  }

  const refreshResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: token.googleRefreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!refreshResponse.ok) {
    return { token, accessToken: null };
  }

  const refreshed = (await refreshResponse.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!refreshed.access_token) return { token, accessToken: null };

  // NextAuth JWT callbacks are responsible for persisting refreshed tokens.
  // This request uses the fresh token immediately; the next session callback
  // can persist it when the session is re-issued.
  return { token, accessToken: refreshed.access_token };
}

export async function GET(req: NextRequest) {
  const { token, accessToken } = await getUsableGoogleAccessToken(req);
  const connected = Boolean(accessToken && hasGmailSendScope(token?.googleScope));

  return NextResponse.json({
    ok: true,
    connected,
    email: connected ? token?.email ?? null : null,
  });
}

export async function POST(req: NextRequest) {
  const { token, accessToken } = await getUsableGoogleAccessToken(req);

  if (!token || !accessToken) {
    return NextResponse.json(
      { ok: false, error: "Gmail is not connected. Sign in with Google and grant Gmail access first." },
      { status: 401 }
    );
  }

  if (!hasGmailSendScope(token.googleScope)) {
    return NextResponse.json(
      { ok: false, error: "Gmail send permission is missing. Reconnect Google and grant Gmail access." },
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

    const message = [
      `To: ${payload.to}`,
      `Subject: ${payload.subject}`,
      "Content-Type: text/plain; charset=UTF-8",
      "MIME-Version: 1.0",
      "",
      payload.body,
    ].join("\r\n");

    const raw = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
    });

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
