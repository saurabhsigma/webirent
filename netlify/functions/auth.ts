import { HandlerEvent, HandlerContext } from '@netlify/functions';
import { NextRequest } from 'next/server';
import { authOptions } from '../../app/api/auth/[...nextauth]/route';
import NextAuth from 'next-auth';

export async function handler(event: HandlerEvent, context: HandlerContext) {
  const request = new Request(event.rawUrl, {
    method: event.httpMethod,
    headers: event.headers as HeadersInit,
    body: event.body ? event.body : undefined,
  });

  const response = await NextAuth(authOptions)(request as unknown as NextRequest);
  
  return {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    body: await response.text(),
  };
} 