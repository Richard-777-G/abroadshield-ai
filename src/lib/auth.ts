/**
 * Authentication Configuration
 * NextAuth.js setup for secure user sessions
 */

import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    // Email + Password
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('No user found with this email');
        }

        // Compare password (in production, use proper hashing)
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password || ''
        );

        if (!passwordMatch) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),

    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),

    // GitHub OAuth
    GithubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // Check if user exists
      let dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
      });

      // Create user if doesn't exist
      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            email: user.email!,
            name: user.name || '',
            targetPhase: 'pre-departure',
          },
        });

        // Initialize agent memory
        await prisma.agentMemory.create({
          data: {
            userId: dbUser.id,
            currentPhase: 'pre-departure',
            goals: JSON.stringify({
              wantJob: false,
              wantNetworking: false,
              targetSectors: [],
              targetRoles: [],
            }),
            preferences: JSON.stringify({}),
          },
        });
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
};
