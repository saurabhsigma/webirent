import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';

// Extend the JWT interface provided by NextAuth to include custom fields
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      email: string;
    };
    accessToken?: string;
  }

  interface JWT {
    id: string;
    role: string;
    email: string;
    accessToken?: string;
  }
}

interface UserType {
  _id: string;
  name: string;
  email: string;
  role: string;
  password: string;
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide email and password');
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email }).select('+password');

        if (!user) {
          throw new Error('Invalid email or password');
        }

        const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordMatch) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: UserType }) {
      if (user) {
        token.id = user._id.toString();
        token.role = user.role;
        token.email = user.email;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.email = token.email;
        session.accessToken = token.accessToken; // Add this line
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production',
};

export default NextAuth(authOptions);
