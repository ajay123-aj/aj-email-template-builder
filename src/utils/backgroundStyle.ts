import type { BackgroundOptions } from '../types/template';

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
