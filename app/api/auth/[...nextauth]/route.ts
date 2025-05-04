import NextAuth, { DefaultUser, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import UserModel from '@/models/User';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';
import { Account, Profile } from 'next-auth';

interface CustomUser extends DefaultUser {
  role: string;
  name?: string;
}

// Extend the JWT interface provided by NextAuth to include custom fields
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      email: string;
      name?: string;
    };
    accessToken?: string;
  }

  interface JWT {
    id: string;
    role: string;
    email: string;
    name?: string;
    accessToken?: string;
  }
}

interface UserDocument {
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

        const user = await UserModel.findOne({ email: credentials.email }).select('+password') as UserDocument;

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
        } as CustomUser;
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ 
      token, 
      user, 
      account, 
      profile 
    }: { 
      token: JWT; 
      user?: User | AdapterUser; 
      account?: Account | null; 
      profile?: Profile | undefined;
    }) {
      if (user) {
        const customUser = user as CustomUser;
        return {
          ...token,
          id: customUser.id,
          role: customUser.role,
          email: customUser.email,
          name: customUser.name,
        };
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: String(token.id),
          role: String(token.role),
          email: String(token.email),
          name: token.name ? String(token.name) : undefined,
        },
        accessToken: token.accessToken ? String(token.accessToken) : undefined,
      };
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
