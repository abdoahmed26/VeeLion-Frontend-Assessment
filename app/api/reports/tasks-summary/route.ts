import { NextResponse } from 'next/server';
import { getSummaryFromBackend } from '@/lib/backendApi';
import { apiErrorResponse } from '@/lib/apiResponse';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    return NextResponse.json(await getSummaryFromBackend());
  } catch (error) {
    return apiErrorResponse(error);
  }
}
