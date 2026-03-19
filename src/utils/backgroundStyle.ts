import type { BackgroundOptions, ButtonConfig, DividerConfig } from '../types/template';

export function getDividerBorderStyle(c: DividerConfig | undefined): string {
  if (!c) return '#e5e7eb';
  const type = c.borderColorType ?? (c.borderGradient?.colors?.length ? 'gradient' : 'color');
  if (type === 'color') return c.borderColor ?? '#e5e7eb';
  if (type === 'gradient' && c.borderGradient?.colors?.length) {
    const angle = c.borderGradient.angle ?? 90;
    const stops = c.borderGradient.colors
      .map((col, i) => {
        const pct = c.borderGradient!.colors!.length === 1 ? '100%' : `${(i / (c.borderGradient!.colors!.length - 1)) * 100}%`;
        return `${col} ${pct}`;
      })
      .join(', ');
    return `linear-gradient(${angle}deg, ${stops})`;
  }
  return c.borderColor ?? '#e5e7eb';
}

export function getButtonBackgroundStyle(c: ButtonConfig | undefined): string {
  if (!c) return '#3b82f6';
  const type = c.backgroundColorType ?? (c.backgroundGradient?.colors?.length ? 'gradient' : 'color');
  if (type === 'color') return c.backgroundColor ?? '#3b82f6';
  if (type === 'gradient' && c.backgroundGradient?.colors?.length) {
    const angle = c.backgroundGradient.angle ?? 90;
    const stops = c.backgroundGradient.colors
      .map((col, i) => {
        const pct = c.backgroundGradient!.colors!.length === 1 ? '100%' : `${(i / (c.backgroundGradient!.colors!.length - 1)) * 100}%`;
        return `${col} ${pct}`;
      })
      .join(', ');
    return `linear-gradient(${angle}deg, ${stops})`;
  }
  return c.backgroundColor ?? '#3b82f6';
}

export function getBackgroundStyle(bg: BackgroundOptions | undefined): string {
  if (!bg) return '#ffffff';
  const type = bg.backgroundType ?? (bg.backgroundColor ? 'color' : 'color');
  const fallback = bg.backgroundColor ?? '#ffffff';

  if (type === 'color') {
    return fallback;
  }

  if (type === 'gradient' && bg.backgroundGradient?.colors?.length) {
    const angle = bg.backgroundGradient.angle ?? 90;
    const stops = bg.backgroundGradient.colors
      .map((c, i) => {
        const pct = bg.backgroundGradient!.colors!.length === 1 ? '100%' : `${(i / (bg.backgroundGradient!.colors!.length - 1)) * 100}%`;
        return `${c} ${pct}`;
      })
      .join(', ');
    return `linear-gradient(${angle}deg, ${stops})`;
  }

  if (type === 'image' && bg.backgroundImageUrl?.trim()) {
    const url = bg.backgroundImageUrl.trim();
    const size = bg.backgroundImageSize ?? 'cover';
    const position = bg.backgroundImagePosition ?? 'center';
    return `url("${url.replace(/"/g, '%22')}") ${position} / ${size} no-repeat`;
  }

  return fallback;
}
