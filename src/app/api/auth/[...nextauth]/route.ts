import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

const GOOGLE_SCOPE = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.send",
].join(" ");

type GoogleToken = {
  googleAccessToken?: string;
  googleRefreshToken?: string;
  googleScope?: string;
  googleAccessTokenExpires?: number;
};

async function refreshGoogleAccessToken(token: GoogleToken) {
  if (!token.googleRefreshToken || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return token;
  }

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: token.googleRefreshToken,
      }),
    });

    const refreshed = await response.json();
    if (!response.ok || !refreshed.access_token) {
      console.error("[auth] Google token refresh failed", response.status, refreshed.error);
      return { ...token, googleRefreshError: true };
    }

    return {
      ...token,
      googleAccessToken: refreshed.access_token,
      googleAccessTokenExpires: Date.now() + (Number(refreshed.expires_in) || 3600) * 1000,
      googleScope: refreshed.scope ?? token.googleScope,
    };
  } catch (error) {
    console.error("[auth] Google token refresh error", error);
    return { ...token, googleRefreshError: true };
  }
}

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET ?? "abroadshield-dev-secret-change-in-production",
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        return {
          id: credentials.email,
          email: credentials.email,
          name: credentials.name ?? credentials.email.split("@")[0],
          image: null,
        };
      },
    }),

    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
              params: {
                scope: GOOGLE_SCOPE,
                access_type: "offline",
                prompt: "consent",
              },
            },
          }),
        ]
      : []),

    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
          }),
        ]
      : []),
  ],

  pages: { signIn: "/" },

  callbacks: {
    async jwt({ token, account }) {
      let googleToken = token as typeof token & GoogleToken;

      if (account?.provider === "google") {
        googleToken.googleAccessToken = account.access_token;
        googleToken.googleScope = account.scope;
        googleToken.googleAccessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : undefined;
        if (account.refresh_token) {
          googleToken.googleRefreshToken = account.refresh_token;
        }
      }

      if (
        googleToken.googleRefreshToken &&
        googleToken.googleAccessTokenExpires &&
        Date.now() > googleToken.googleAccessTokenExpires - 60_000
      ) {
        googleToken = (await refreshGoogleAccessToken(googleToken)) as typeof googleToken;
      }

      return googleToken;
    },
    async session({ session, token }) {
      const googleToken = token as typeof token & GoogleToken & { googleRefreshError?: boolean };
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      (session as typeof session & { gmailConnected?: boolean; gmailRefreshError?: boolean }).gmailConnected =
        Boolean(
          googleToken.googleAccessToken &&
            googleToken.googleScope?.includes("https://www.googleapis.com/auth/gmail.compose") &&
            googleToken.googleScope?.includes("https://www.googleapis.com/auth/gmail.send")
        );
      (session as typeof session & { gmailRefreshError?: boolean }).gmailRefreshError =
        Boolean(googleToken.googleRefreshError);
      return session;
    },
  },
});

export { handler as GET, handler as POST };
