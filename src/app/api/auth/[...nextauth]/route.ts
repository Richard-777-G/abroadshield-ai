import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";

const GOOGLE_SCOPE = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.send",
].join(" ");

type GoogleToken = { googleAccessToken?: string; googleRefreshToken?: string; googleScope?: string; googleAccessTokenExpires?: number; googleRefreshError?: boolean };

type UserLike = { id: string; email?: string | null; name?: string | null; image?: string | null };

async function refreshGoogleAccessToken(token: GoogleToken) {
  if (!token.googleRefreshToken || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return token;
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, grant_type: "refresh_token", refresh_token: token.googleRefreshToken }) });
    const refreshed = await response.json();
    if (!response.ok || !refreshed.access_token) return { ...token, googleRefreshError: true };
    return { ...token, googleAccessToken: refreshed.access_token, googleAccessTokenExpires: Date.now() + (Number(refreshed.expires_in) || 3600) * 1000, googleScope: refreshed.scope ?? token.googleScope, googleRefreshError: false };
  } catch { return { ...token, googleRefreshError: true }; }
}

async function resolveDbUser(user: UserLike) {
  if (!user.email) throw new Error("OAuth provider did not return an email address.");
  return db.user.upsert({
    where: { email: user.email.toLowerCase() },
    update: { name: user.name ?? undefined },
    create: { email: user.email.toLowerCase(), name: user.name ?? undefined },
  });
}

async function persistGoogleConnection(email: string | null | undefined, token: GoogleToken) {
  if (!email || !token.googleAccessToken) return;
  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return;
  await db.googleConnection.upsert({
    where: { userId_provider: { userId: user.id, provider: "google" } },
    update: { email: user.email, accessToken: token.googleAccessToken, ...(token.googleRefreshToken ? { refreshToken: token.googleRefreshToken } : {}), scope: token.googleScope, expiresAt: token.googleAccessTokenExpires ? new Date(token.googleAccessTokenExpires) : null },
    create: { userId: user.id, provider: "google", email: user.email, accessToken: token.googleAccessToken, refreshToken: token.googleRefreshToken, scope: token.googleScope, expiresAt: token.googleAccessTokenExpires ? new Date(token.googleAccessTokenExpires) : null },
  });
}

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;
        const user = await db.user.findUnique({ where: { email } });
        if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) return null;
        return { id: user.id, email: user.email, name: user.name, image: null };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET, authorization: { params: { scope: GOOGLE_SCOPE, access_type: "offline", prompt: "consent" } } })] : []),
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET ? [GitHubProvider({ clientId: process.env.GITHUB_ID, clientSecret: process.env.GITHUB_SECRET })] : []),
  ],
  pages: { signIn: "/" },
  callbacks: {
    async jwt({ token, user, account }) {
      let googleToken = token as typeof token & GoogleToken;
      if (user?.email) {
        const dbUser = await resolveDbUser(user as UserLike);
        googleToken.sub = dbUser.id;
        googleToken.email = dbUser.email;
        googleToken.name = dbUser.name;
      }
      if (account?.provider === "google") {
        googleToken.googleAccessToken = account.access_token;
        googleToken.googleScope = account.scope;
        googleToken.googleAccessTokenExpires = account.expires_at ? account.expires_at * 1000 : undefined;
        if (account.refresh_token) googleToken.googleRefreshToken = account.refresh_token;
      }
      if (googleToken.googleRefreshToken && googleToken.googleAccessTokenExpires && Date.now() > googleToken.googleAccessTokenExpires - 60_000) googleToken = (await refreshGoogleAccessToken(googleToken)) as typeof googleToken;
      if (googleToken.googleAccessToken && googleToken.email) { try { await persistGoogleConnection(googleToken.email, googleToken); } catch (error) { console.error("[auth] Failed to persist Google connection", error); } }
      return googleToken;
    },
    async session({ session, token }) {
      const googleToken = token as typeof token & GoogleToken;
      if (session.user && token.sub) (session.user as { id?: string }).id = token.sub;
      (session as typeof session & { gmailConnected?: boolean; gmailRefreshError?: boolean }).gmailConnected = Boolean(googleToken.googleAccessToken && googleToken.googleScope?.includes("https://www.googleapis.com/auth/gmail.readonly") && googleToken.googleScope?.includes("https://www.googleapis.com/auth/gmail.send"));
      (session as typeof session & { gmailRefreshError?: boolean }).gmailRefreshError = Boolean(googleToken.googleRefreshError);
      return session;
    },
  },
});

export { handler as GET, handler as POST };
