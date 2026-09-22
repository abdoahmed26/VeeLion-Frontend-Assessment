import { NextResponse } from 'next/server';
import { getActivityFromBackend } from '@/lib/backendApi';
import { apiErrorResponse } from '@/lib/apiResponse';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    return NextResponse.json(await getActivityFromBackend());
  } catch (error) {
    return apiErrorResponse(error);
  }
}
