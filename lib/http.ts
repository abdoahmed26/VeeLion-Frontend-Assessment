export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
export async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (response.status === 204 && response.ok) return undefined as T;
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ApiError(
      response.ok
        ? 'The server returned an invalid response.'
        : 'Request failed. Please try again.',
      response.ok ? 502 : response.status,
    );
  }
  if (!response.ok) {
    const message = (body as { error?: { message?: unknown } } | null)?.error?.message;
    throw new ApiError(
      typeof message === 'string' ? message : 'Request failed. Please try again.',
      response.status,
    );
  }
  return body as T;
}
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}
