import { NextResponse } from 'next/server';
import { ApiError } from '@/lib/http';
export function apiErrorResponse(error: unknown) {
  const status = error instanceof ApiError ? error.status : 500;
  const message = error instanceof ApiError ? error.message : 'Unable to complete the request.';
  return NextResponse.json({ error: { message } }, { status });
}
