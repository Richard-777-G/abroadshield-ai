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
      const googleToken = token as typeof token & GoogleToken;

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

      return googleToken;
    },
    async session({ session, token }) {
      const googleToken = token as typeof token & GoogleToken;
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      (session as typeof session & { gmailConnected?: boolean }).gmailConnected =
        Boolean(
          googleToken.googleAccessToken &&
            googleToken.googleScope?.includes("https://www.googleapis.com/auth/gmail.compose") &&
            googleToken.googleScope?.includes("https://www.googleapis.com/auth/gmail.send")
        );
      return session;
    },
  },
});

export { handler as GET, handler as POST };
