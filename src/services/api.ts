type HttpMethod = 'GET' | 'POST';

interface ApiRequestOptions {
  method: HttpMethod;
  action: string;
  payload?: Record<string, unknown>;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error: string | null;
}

const API_BASE_URL =
  (import.meta as any)?.env?.VITE_GAS_WEB_APP_URL?.trim?.() ||
  'https://script.google.com/macros/s/AKfycbxnJQfgb11laK9oJ30MQzW8Es6YdLArUeJfOM_wTSyEH9OZ_GpHpMgZIBlvjDGkDAEb/exec';

export const isConfigured = !!API_BASE_URL;

function buildUrl(action: string): string {
  if (!isConfigured) {
    throw new Error('Missing VITE_GAS_WEB_APP_URL environment variable');
  }

  const url = new URL(API_BASE_URL);
  url.searchParams.set('action', action);
  return url.toString();
}

async function parseJsonSafely<T>(response: Response): Promise<ApiEnvelope<T>> {
  const text = await response.text();

  if (!text) {
    throw new Error('Empty response from API');
  }

  try {
    return JSON.parse(text) as ApiEnvelope<T>;
  } catch (error) {
    throw new Error('Failed to parse API response as JSON');
  }
}

export async function apiRequest<T>({
  method,
  action,
  payload,
}: ApiRequestOptions): Promise<T> {
  try {
    let response: Response;

    if (method === 'GET') {
      response = await fetch(buildUrl(action), {
        method: 'GET',
        redirect: 'follow',
      });
    } else {
      if (!isConfigured) {
        throw new Error('Missing VITE_GAS_WEB_APP_URL environment variable');
      }

      response = await fetch(API_BASE_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action,
          ...(payload || {}),
        }),
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await parseJsonSafely<T>(response);

    if (!result.success) {
      throw new Error(result.error || `API action failed: ${action}`);
    }

    return result.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Unexpected API error while calling ${action}`);
  }
}