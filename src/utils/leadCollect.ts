import { getAjEmailEditorApiUrl } from './ajBackendUrl';
import { getOrCreateDeviceId } from './deviceId';

const LIFETIME_OPENS_KEY = 'aj-email-editor:lifetime-open-count';
/** Suppress duplicate work when React StrictMode runs effects twice in dev (new instance each time). */
const LEAD_COLLECT_DEDUPE_KEY = 'aj-email-editor:lead-collect-dedupe-ts';
const LEAD_COLLECT_DEDUPE_MS = 3000;

function tryAcquireLeadCollectSlot(): boolean {
  if (typeof sessionStorage === 'undefined') return true;
  try {
    const raw = sessionStorage.getItem(LEAD_COLLECT_DEDUPE_KEY);
    const prev = raw ? parseInt(raw, 10) : NaN;
    const now = Date.now();
    if (Number.isFinite(prev) && now - prev < LEAD_COLLECT_DEDUPE_MS) {
      return false;
    }
    sessionStorage.setItem(LEAD_COLLECT_DEDUPE_KEY, String(now));
    return true;
  } catch {
    return true;
  }
}

export function getLeadCollectEndpointUrl(): string | null {
  return getAjEmailEditorApiUrl('leads/collect');
}

/**
 * If the user allows location (or a cached fix exists), returns coords; otherwise null.
 * Never throws; denial / timeout / unsupported API is treated as "not required".
 */
function tryGetGeolocation(): Promise<{
  latitude: number;
  longitude: number;
  locationAccuracy?: number;
} | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation?.getCurrentPosition) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    let settled = false;
    const done = (value: { latitude: number; longitude: number; locationAccuracy?: number } | null) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    const hardTimeoutMs = 12_000;
    const t = window.setTimeout(() => done(null), hardTimeoutMs);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        window.clearTimeout(t);
        const { latitude, longitude, accuracy } = pos.coords;
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          done(null);
          return;
        }
        const out: { latitude: number; longitude: number; locationAccuracy?: number } = {
          latitude,
          longitude,
        };
        if (accuracy != null && Number.isFinite(accuracy)) {
          out.locationAccuracy = accuracy;
        }
        done(out);
      },
      () => {
        window.clearTimeout(t);
        done(null);
      },
      {
        enableHighAccuracy: false,
        maximumAge: 300_000,
        timeout: 10_000,
      }
    );
  });
}

function bumpLifetimeOpenCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const prev = parseInt(localStorage.getItem(LIFETIME_OPENS_KEY) ?? '0', 10);
    const next = Number.isFinite(prev) && prev >= 0 ? prev + 1 : 1;
    localStorage.setItem(LIFETIME_OPENS_KEY, String(next));
    return next;
  } catch {
    return 1;
  }
}

function buildPayload(lifetimeOpenCount: number): Record<string, unknown> {
  const deviceId = getOrCreateDeviceId();
  const body: Record<string, unknown> = {
    deviceId,
    lifetimeOpenCount,
  };

  if (typeof navigator !== 'undefined') {
    if (navigator.language) body.language = navigator.language;
    if (navigator.languages?.length) body.languages = [...navigator.languages];
  }

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) body.timezone = tz;
  } catch {
    /* ignore */
  }

  if (typeof screen !== 'undefined') {
    body.screenWidth = screen.width;
    body.screenHeight = screen.height;
    body.colorDepth = screen.colorDepth;
  }

  if (typeof window !== 'undefined') {
    body.pixelRatio = window.devicePixelRatio ?? 1;
    body.viewportWidth = window.innerWidth;
    body.viewportHeight = window.innerHeight;
    if (document.referrer) body.referrer = document.referrer;
    body.pageUrl = window.location.href;
  }

  return body;
}

export type LeadCollectResult =
  | { ok: true; skipped: true; reason: 'no_endpoint' }
  | { ok: true; skipped: true; reason: 'no_device_id' }
  | { ok: true; skipped: true; reason: 'deduped' }
  | { ok: true; status: number; json: unknown }
  | { ok: false; error: string };

/**
 * POSTs to the AJ Email Editor leads collect API. Safe to fire-and-forget; server may throttle (200 + accepted: false).
 */
export async function collectAjEmailEditorLead(): Promise<LeadCollectResult> {
  const url = getLeadCollectEndpointUrl();
  if (!url) return { ok: true, skipped: true, reason: 'no_endpoint' };

  if (!tryAcquireLeadCollectSlot()) {
    return { ok: true, skipped: true, reason: 'deduped' };
  }

  const lifetimeOpenCount = bumpLifetimeOpenCount();
  const payload = buildPayload(lifetimeOpenCount);

  const geo = await tryGetGeolocation();
  if (geo) {
    payload.latitude = geo.latitude;
    payload.longitude = geo.longitude;
    if (geo.locationAccuracy != null) payload.locationAccuracy = geo.locationAccuracy;
  }

  const deviceId = payload.deviceId;
  if (typeof deviceId !== 'string' || deviceId.length < 4 || deviceId.length > 512) {
    return { ok: true, skipped: true, reason: 'no_device_id' };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    const json = await res.json().catch(() => null);
    return { ok: true, status: res.status, json };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: message };
  }
}
