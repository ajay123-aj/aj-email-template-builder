const DEFAULT_TOP_BOTTOM = '24px';

const isZeroVal = (v: string) => !v || v === '0' || v === '0px';

/**
 * Parses main padding: user value applies to left/right; top/bottom use default (except when 0).
 * - "0px" -> all sides 0 (no gap)
 * - "10px" -> top: default, right: 10px, bottom: default, left: 10px
 * - "10px 20px" -> top: default, right: 20px, bottom: default, left: 10px
 * - "10px 20px 30px 40px" -> full explicit (top, right, bottom, left)
 */
export function parsePadding(value: string | undefined, fallback = '24px'): [string, string, string, string] {
  const v = (value ?? fallback).trim().replace(/\s+/g, ' ');
  if (!v) return [fallback, fallback, fallback, fallback];
  const parts = v.split(/\s+/);
  if (parts.length === 1) {
    if (isZeroVal(parts[0])) return [parts[0], parts[0], parts[0], parts[0]];
    return [DEFAULT_TOP_BOTTOM, parts[0], DEFAULT_TOP_BOTTOM, parts[0]];
  }
  if (parts.length === 2) {
    if (isZeroVal(parts[0]) && isZeroVal(parts[1])) return [parts[0], parts[1], parts[0], parts[1]];
    return [DEFAULT_TOP_BOTTOM, parts[1], DEFAULT_TOP_BOTTOM, parts[0]];
  }
  if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]];
  return [parts[0], parts[1], parts[2], parts[3]];
}

/**
 * Parses block padding (header, footer, etc.): standard CSS shorthand, ensures all sides get a value.
 * - "16px" -> all sides 16px
 * - "16px 24px" -> top/bottom 16px, left/right 24px
 * - "10px 20px 30px 40px" -> top, right, bottom, left
 */
export function parsePaddingBlock(value: string | undefined, fallback = '16px'): [string, string, string, string] {
  const v = (value ?? fallback).trim().replace(/\s+/g, ' ');
  if (!v) return [fallback, fallback, fallback, fallback];
  const parts = v.split(/\s+/);
  if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
  if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
  if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]];
  return [parts[0], parts[1], parts[2], parts[3]];
}

export function paddingBlockToStyle(value: string | undefined, fallback = '16px'): { paddingTop: string; paddingRight: string; paddingBottom: string; paddingLeft: string } {
  const [top, right, bottom, left] = parsePaddingBlock(value, fallback);
  return { paddingTop: top, paddingRight: right, paddingBottom: bottom, paddingLeft: left };
}

export function paddingBlockToCss(value: string | undefined, fallback = '16px'): string {
  const [top, right, bottom, left] = parsePaddingBlock(value, fallback);
  return `${top} ${right} ${bottom} ${left}`;
}

/** Returns true if all padding values are 0 or 0px */
export function isPaddingZero(value: string | undefined): boolean {
  if (value == null || String(value).trim() === '') return false;
  const [top, right, bottom, left] = parsePaddingBlock(value, '0');
  const isZero = (v: string) => !v || v === '0' || v === '0px';
  return isZero(top) && isZero(right) && isZero(bottom) && isZero(left);
}

export function paddingToStyle(value: string | undefined, fallback = '24px'): { paddingTop: string; paddingRight: string; paddingBottom: string; paddingLeft: string } {
  const [top, right, bottom, left] = parsePadding(value, fallback);
  return { paddingTop: top, paddingRight: right, paddingBottom: bottom, paddingLeft: left };
}

export function paddingToCss(value: string | undefined, fallback = '24px'): string {
  const [top, right, bottom, left] = parsePadding(value, fallback);
  return `${top} ${right} ${bottom} ${left}`;
}
