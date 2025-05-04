import { NextAuthHandler } from 'next-auth';
import { authOptions } from '../../app/api/auth/[...nextauth]/route';

export const handler = NextAuthHandler(authOptions); 