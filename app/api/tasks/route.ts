import { NextResponse } from 'next/server';
import { getTasksFromBackend, createTaskInBackend } from '@/lib/backendApi';
import { readTaskPayload } from '@/lib/taskPayload';
import { apiErrorResponse } from '@/lib/apiResponse';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try {
    return NextResponse.json(
      { data: await createTaskInBackend(await readTaskPayload(request, true)) },
      { status: 201 },
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
export async function GET() {
  try {
    return NextResponse.json({ data: await getTasksFromBackend() });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
