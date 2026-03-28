function normalizeApiPrefix(raw: string): string {
  const t = raw.trim();
  if (!t) return '';
  return t.startsWith('/') ? t : `/${t}`;
}

/** Same base as lead collect: VITE_LEAD_COLLECT_API_ORIGIN + VITE_API_PREFIX. */
export function getAjEmailEditorApiUrl(resourcePath: string): string | null {
  const origin = (import.meta.env.VITE_LEAD_COLLECT_API_ORIGIN as string | undefined)?.trim();
  if (!origin) return null;
  const base = origin.replace(/\/$/, '');
  const prefix = normalizeApiPrefix((import.meta.env.VITE_API_PREFIX as string | undefined) ?? '');
  const sub = resourcePath.replace(/^\//, '');
  return `${base}${prefix}/api/aj-email-editor/${sub}`;
}
