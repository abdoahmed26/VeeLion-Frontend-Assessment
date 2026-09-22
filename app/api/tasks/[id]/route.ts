import { NextResponse } from 'next/server';
import { getTaskFromBackend, updateTaskInBackend, deleteTaskInBackend } from '@/lib/backendApi';
import { apiErrorResponse } from '@/lib/apiResponse';
import { readTaskPayload } from '@/lib/taskPayload';
type RouteContext = { params: { id: string } };
export const dynamic = 'force-dynamic';
export async function GET(_request: Request, { params }: RouteContext) {
  try {
    return NextResponse.json({ data: await getTaskFromBackend(params.id) });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    return NextResponse.json({
      data: await updateTaskInBackend(params.id, await readTaskPayload(request)),
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    await deleteTaskInBackend(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
