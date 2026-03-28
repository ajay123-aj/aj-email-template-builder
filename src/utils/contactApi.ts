import { getAjEmailEditorApiUrl } from './ajBackendUrl';

export interface ContactFormPayload {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  pageUrl: string;
  extra: Record<string, unknown>;
}

export type ContactSubmitResult =
  | { ok: true; skipped: true; reason: 'no_endpoint' }
  | { ok: true; status: number; json: unknown }
  | { ok: false; status?: number; message: string };

export async function submitContactForm(input: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  extra?: Record<string, unknown>;
}): Promise<ContactSubmitResult> {
  const url = getAjEmailEditorApiUrl('contacts');
  if (!url) return { ok: true, skipped: true, reason: 'no_endpoint' };

  const body: ContactFormPayload = {
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    subject: input.subject.trim(),
    message: input.message.trim(),
    pageUrl: typeof window !== 'undefined' ? window.location.href : '',
    extra: input.extra ?? {},
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include',
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const msg =
        (json && typeof json === 'object' && 'message' in json && typeof (json as { message: unknown }).message === 'string'
          ? (json as { message: string }).message
          : null) || `Request failed (${res.status})`;
      return { ok: false, status: res.status, message: msg };
    }
    return { ok: true, status: res.status, json };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, message };
  }
}
