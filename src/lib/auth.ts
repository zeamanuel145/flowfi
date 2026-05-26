import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/db/connect';
import User from '@/models/User';
import { AuthLoginSchema } from '@/lib/validations';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        const normalizedCredentials = {
          email: credentials.email.trim().toLowerCase(),
          password: credentials.password,
        };

        const parsed = AuthLoginSchema.safeParse(normalizedCredentials);
        if (!parsed.success) {
          throw new Error(parsed.error.errors[0]?.message ?? 'Invalid login data');
        }

        try {
          await connectDB();
          const user = await User.findOne({ email: normalizedCredentials.email }).select('+password');

          if (!user) {
            throw new Error('No account found with this email');
          }

          if (!user.emailVerified) {
            throw new Error('Please verify your email before logging in');
          }

          const isPasswordValid = await user.comparePassword(normalizedCredentials.password);
          if (!isPasswordValid) {
            throw new Error('Incorrect password');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.profileIcon,
          };
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : 'Authentication failed');
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
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
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
