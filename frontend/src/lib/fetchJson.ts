export async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  const text = await response.text();
  if (!text) return fallback;
  try {
    const body = JSON.parse(text) as { message?: string };
    if (body?.message) return body.message;
  } catch {
    // plain text body
  }
  return text || fallback;
}

export async function fetchJson<T>(
  url: string,
  init?: RequestInit & { signal?: AbortSignal }
): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `Request failed (${response.status})`));
  }
  return response.json() as Promise<T>;
}
