import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

const GOOGLE_SCOPE = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.compose",
].join(" ");

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
      if (account?.provider === "google") {
        token.googleAccessToken = account.access_token;
        token.googleScope = account.scope;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      (session as typeof session & { gmailConnected?: boolean }).gmailConnected =
        Boolean(token.googleAccessToken && token.googleScope?.includes("gmail.compose"));
      return session;
    },
  },
});

export { handler as GET, handler as POST };
