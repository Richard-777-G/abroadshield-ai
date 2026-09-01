import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

/**
 * NextAuth configuration.
 *
 * Providers that work immediately (no external credentials):
 *   - Credentials: email + any password (demo mode — no DB check)
 *
 * Providers that require Vercel env vars to be set:
 *   - Google  → GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET
 *   - GitHub  → GITHUB_ID + GITHUB_SECRET
 *
 * Required env vars in all cases:
 *   - NEXTAUTH_SECRET  (any random string, e.g. `openssl rand -base64 32`)
 *   - NEXTAUTH_URL     (e.g. https://abroadshield-ai.vercel.app)
 */

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET ?? "abroadshield-dev-secret-change-in-production",
  providers: [
    // ── Credentials (works immediately, no setup needed) ──────────────────
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        // Demo mode: accept any email+password combo.
        // In production: check DB with Prisma here.
        if (!credentials?.email) return null;
        return {
          id: credentials.email,
          email: credentials.email,
          name: credentials.name ?? credentials.email.split("@")[0],
          image: null,
        };
      },
    }),

    // ── Google (activate by adding GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET) ─
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    // ── GitHub (activate by adding GITHUB_ID + GITHUB_SECRET) ────────────
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
          }),
        ]
      : []),
  ],

  pages: {
    signIn: "/",   // we handle the modal on the landing page itself
  },

  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
