import type { EmailTemplate, AnyBlock } from '../types/template';
import { getBackgroundStyle, getButtonBackgroundStyle, getDividerBorderStyle } from './backgroundStyle';
import { paddingBlockToCss, isPaddingZero } from './paddingUtils';

/** Split column blocks into groups by section markers. */
function splitIntoSectionGroups(blocks: AnyBlock[]): { sectionBlock: AnyBlock | null; contentBlocks: AnyBlock[] }[] {
  const out: { sectionBlock: AnyBlock | null; contentBlocks: AnyBlock[] }[] = [];
  let i = 0;
  while (i < blocks.length) {
    if (blocks[i].type === 'section') {
      const sectionBlock = blocks[i];
      const contentBlocks: AnyBlock[] = [];
      i++;
      while (i < blocks.length && blocks[i].type !== 'section') {
        contentBlocks.push(blocks[i]);
        i++;
      }
      out.push({ sectionBlock, contentBlocks });
    } else {
      const contentBlocks: AnyBlock[] = [];
      while (i < blocks.length && blocks[i].type !== 'section') {
        contentBlocks.push(blocks[i]);
        i++;
      }
      if (contentBlocks.length) out.push({ sectionBlock: null, contentBlocks });
    }
  }
  return out;
}

function esc(s: string) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function contentToHtml(content: string | undefined): string {
  const raw = (content ?? '').replace(/<br\s*\/?>/gi, '\n');
  return esc(raw).replace(/\n/g, '<br/>');
}

function blockHtml(b: AnyBlock): string {
  const c = b.config as Record<string, unknown>;
  switch (b.type) {
    case 'text':
      return `<p style="margin:${c.margin ?? '0 0 8px'};font-size:${c.fontSize ?? '14px'};color:${c.color ?? '#374151'};text-align:${c.alignment ?? 'left'};font-family:${c.fontFamily ?? 'sans-serif'};font-weight:${c.fontWeight ?? 'normal'};font-style:${c.fontStyle ?? 'normal'};line-height:${(c.lineHeight as string)?.trim() || '1.5'};padding:${c.padding ?? '0'};background:${c.backgroundColor ?? 'transparent'};word-wrap:break-word;">${contentToHtml(c.content as string)}</p>`;
    case 'heading': {
      const l = (c.level as number) ?? 2;
      return `<h${l} style="margin:${c.margin ?? '0 0 8px'};font-size:${c.fontSize ?? '24px'};color:${c.color ?? '#111827'};text-align:${c.alignment ?? 'left'};font-family:${c.fontFamily ?? 'sans-serif'};font-weight:${c.fontWeight ?? 'bold'};font-style:${c.fontStyle ?? 'normal'};line-height:${(c.lineHeight as string)?.trim() || '1.5'};padding:${c.padding ?? '0'};background:${c.backgroundColor ?? 'transparent'};">${contentToHtml(c.content as string)}</h${l}>`;
    }
    case 'image': {
      const imgSrc = (c.src as string)?.trim();
      if (!imgSrc) {
        return `<div style="min-height:120px;background:#f1f5f9;border:1px dashed #cbd5e1;display:flex;align-items:center;justify-content:center;color:#0f172a;font-size:12px;">Image</div>`;
      }
      return `<img src="${esc(imgSrc)}" alt="${esc(String(c.alt || ''))}" width="${c.width ?? '100%'}" style="max-width:100%;height:auto;display:block;" />`;
    }
    case 'button': {
      const btnBg = getButtonBackgroundStyle(c as unknown as Parameters<typeof getButtonBackgroundStyle>[0]);
      return `<table cellpadding="0" cellspacing="0" border="0" align="${c.alignment ?? 'center'}" style="margin:0 auto;width:auto;"><tr><td style="padding:${c.padding ?? '12px 24px'};background:${btnBg};border-radius:${c.borderRadius ?? '4px'}"><a href="${esc(String(c.href || '#'))}" style="color:${c.textColor ?? '#fff'};text-decoration:none;font-weight:600;display:inline-block;font-size:14px;">${esc((c.text as string) ?? 'Button')}</a></td></tr></table>`;
    }
    case 'divider': {
      const divBorderStyle = getDividerBorderStyle(c as Parameters<typeof getDividerBorderStyle>[0]);
      const divIsGradient = divBorderStyle.startsWith('linear-gradient');
      const divBw = c.borderWidth ?? '1px';
      const divMargin = c.margin ?? '12px 0';
      const divWidth = c.width ?? '100%';
      if (divIsGradient) {
        return `<div style="height:${divBw};background:${divBorderStyle};margin:${divMargin};width:${divWidth};"></div>`;
      }
      return `<hr style="border:none;border-top:${divBw} solid ${divBorderStyle};margin:${divMargin};width:${divWidth};" />`;
    }
    case 'spacer':
      return `<div style="height:${c.height ?? '24px'};line-height:0;font-size:0;"></div>`;
    case 'header': {
      const hasLogo = !!(c.logoUrl as string)?.trim();
      const headerBg = getBackgroundStyle(c as Parameters<typeof getBackgroundStyle>[0]) || '#f9fafb';
      const align = c.alignment ?? 'left';
      const headerPad = paddingBlockToCss(c.padding as string, '16px');
      const zeroPad = isPaddingZero(c.padding as string);
      const minH = zeroPad ? '0' : (c.height ?? '60px');
      const lineHVal = (c.lineHeight as string)?.trim() || (zeroPad ? '1' : '');
      const lineH = lineHVal ? `;line-height:${lineHVal}` : '';
      const isGlass = (c.glassmorphism as boolean) === true;
      const glassStyle = isGlass ? `background:rgba(255,255,255,0.15);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.2);border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.08);` : '';
      const style = `padding:${headerPad};background:${isGlass ? 'transparent' : headerBg};min-height:${minH};font-size:${c.fontSize ?? '28px'};color:${c.color ?? '#111827'};text-align:${align};font-weight:${c.fontWeight ?? 'bold'};width:100%;box-sizing:border-box${lineH}${isGlass ? ';' + glassStyle : ''}`;
      const logo = hasLogo ? `<img src="${esc(String(c.logoUrl))}" alt="${esc(String(c.logoAlt || ''))}" style="max-height:48px;width:auto;vertical-align:middle;" />` : '';
      const text = contentToHtml(c.content as string) || 'Header';
      const alignAttr = align === 'center' ? ' align="center"' : align === 'right' ? ' align="right"' : '';
      return hasLogo ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="${style}"><tr><td style="vertical-align:middle;width:1%;white-space:nowrap;padding-right:12px">${logo}</td><td${alignAttr} style="${style}">${text}</td></tr></table>` : `<div style="${style}">${text}</div>`;
    }
    case 'footer': {
      const footerPad = paddingBlockToCss(c.padding as string, '16px');
      return `<div style="padding:${footerPad};background:${c.backgroundColor ?? '#f3f4f6'};font-size:${c.fontSize ?? '12px'};color:${c.color ?? '#6b7280'};text-align:center">${contentToHtml(c.content as string)}</div>`;
    }
    case 'html':
      return (c.html as string) ?? '';
    case 'table': {
      const headers = (c.headers as string[]) ?? ['Header 1', 'Header 2'];
      const rows = (c.rows as string[][]) ?? [];
      const borderColor = c.borderColor ?? '#e5e7eb';
      const fontSize = c.fontSize ?? '14px';
      const align = c.alignment ?? 'left';
      const thCells = headers.map(h => `<th style="border:1px solid ${borderColor};padding:8px 12px;font-weight:bold;background:#f9fafb;text-align:${align}">${contentToHtml(h)}</th>`).join('');
      const trs = rows.map(row => {
        const cells = row.map(cell => `<td style="border:1px solid ${borderColor};padding:8px 12px;text-align:${align}">${contentToHtml(cell)}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
      return `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;font-size:${fontSize}"><thead><tr>${thCells}</tr></thead><tbody>${trs}</tbody></table>`;
    }
    case 'list': {
      const items = (c.items as string[]) ?? ['Item 1', 'Item 2'];
      const listType = (c.listType as 'ul' | 'ol') ?? 'ul';
      const fontSize = c.fontSize ?? '14px';
      const color = c.color ?? '#374151';
      const lis = items.map(item => `<li style="margin-bottom:4px">${contentToHtml(item)}</li>`).join('');
      return `<${listType} style="margin:0 0 8px;padding-left:24px;font-size:${fontSize};color:${color}">${lis}</${listType}>`;
    }
    case 'social': {
      const icons = (c.icons as { type?: string; url?: string }[]) ?? [];
      const align = c.alignment ?? 'center';
      const links = icons.map(icon => `<a href="${esc(String(icon.url || '#'))}" style="display:inline-block;margin:0 8px;color:#6b7280;text-decoration:none">${icon.type || '•'}</a>`).join('');
      return links ? `<div style="text-align:${align};padding:12px 0">${links}</div>` : '<div style="padding:12px;text-align:center;color:#9ca3af;font-size:12px">Social icons</div>';
    }
    case 'columns': {
      const count = (c.count as number) ?? 2;
      const widths = (c.widths as string[]) ?? Array(count).fill(`${100 / count}%`);
      const cells = widths.slice(0, count).map(w => `<td width="${w}" valign="top" style="padding:8px;vertical-align:top"></td>`).join('');
      return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse"><tr>${cells}</tr></table>`;
    }
    case 'section':
      return '';
    default:
      return '';
  }
}

function colHtml(blocks: AnyBlock[]): string {
  const groups = splitIntoSectionGroups(blocks);
  return groups.map(g => {
    const inner = g.contentBlocks.map(blockHtml).join('');
    if (g.sectionBlock) {
      const c = g.sectionBlock.config as Record<string, unknown>;
      const pad = paddingBlockToCss((c.padding as string) ?? '16px', '16px');
      const margin = ((c.margin as string) ?? '0').trim() || '0';
      const bg = getBackgroundStyle(c);
      return `<div style="padding:${pad};margin:${margin};background:${bg}">${inner}</div>`;
    }
    return inner;
  }).join('');
}

const RESPONSIVE_STYLE = `
  html, body { height: auto !important; min-height: 0 !important; }
  body, table, td, p, a, h1, h2, h3, h4 { font-family: Arial, Helvetica, sans-serif; -webkit-text-size-adjust: 100%; }
  .email-wrapper { width: 100%; max-width: 100%; }
  .email-sections-table { border-collapse: collapse; border-spacing: 0; }
  img { border: 0; outline: none; text-decoration: none; max-width: 100%; height: auto !important; }
  @media only screen and (max-width: 500px) {
    .email-wrapper { width: 100% !important; min-width: 0 !important; }
    .email-section-inner:not(.no-padding) { padding: 12px !important; }
    td.email-section-row { display: block !important; width: 100% !important; box-sizing: border-box !important; }
    td.email-section-row + td.email-section-row { padding-top: 12px !important; }
  }
`;

export function exportToEmailHtml(template: EmailTemplate): string {
  const w = template.width ?? '600';
  const wCss = w.replace(/[^0-9.]/g, '') ? `${w.replace(/[^0-9.]/g, '')}px` : '600px';
  const bg = getBackgroundStyle(template);
  const rows = template.sections.map(section => {
    const layout = section.layout ?? 'row';
    const pad = normalizeCssPadding(section.padding ?? '16px');
    const margin = normalizeCssValue(section.margin ?? '0', '0');
    const sbg = getBackgroundStyle(section);
    if (section.columns.length === 0) return '';
    const isZeroPadding = /^0\s*(px|%|em|rem)?$/i.test((pad || '').trim());
    const noPadClass = isZeroPadding ? ' no-padding' : '';
    const innerStyle = `padding:${pad};margin:${margin};background:${sbg}`;
    if (layout === 'column' || section.columns.length === 1) {
      return `<tr><td style="padding:0;vertical-align:top"><div class="email-section-inner${noPadClass}" style="${innerStyle}"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td>${section.columns.map(c => colHtml(c.blocks)).join('')}</td></tr></table></div></td></tr>`;
    }
    const n = section.columns.length;
    const widths = section.columns.map(c => (!c.width || c.width === 'auto' || c.width === '100%') ? `${100 / n}%` : c.width);
    const gap = section.columnGap ?? '8px';
    const separator = section.columnSeparator ?? 'none';
    const sepColor = section.columnSeparatorColor ?? '#e5e7eb';
    const sepStyle = separator === 'line' ? `1px solid ${sepColor}` : separator === 'border' ? `2px solid ${sepColor}` : 'none';
    const cols = section.columns.map((col, i) => {
      const border = i > 0 && separator !== 'none' ? `;border-left:${sepStyle}` : '';
      return `<td class="email-section-row" width="${widths[i]}" valign="top" style="padding:${gap}${border}">${colHtml(col.blocks)}</td>`;
    }).join('');
    return `<tr><td style="padding:0;vertical-align:top"><div class="email-section-inner${noPadClass}" style="${innerStyle}"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cols}</tr></table></div></td></tr>`;
  }).join('');

  const mainPad = paddingBlockToCss(template.padding, '24px 24px 0 24px');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="X-UA-Compatible" content="IE=edge"><title>Email</title><style>${RESPONSIVE_STYLE}</style></head><body style="margin:0;padding:0;background:${bg};-webkit-text-size-adjust:100%;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${bg};min-width:100%;"><tr><td align="center" valign="top" style="padding:0"><table class="email-wrapper" role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:${wCss};max-width:100%;margin:0 auto;background:#fff;border-collapse:collapse;"><tr><td class="email-main" style="padding:${mainPad}"><table class="email-sections-table" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table></td></tr></table></td></tr></table></body></html>`;
}

function normalizeCssPadding(value: string): string {
  if (!value || typeof value !== 'string') return '24px';
  return value.trim().replace(/\s+/g, ' ').replace(/\s*px/gi, 'px').replace(/\s*%/g, '%') || '24px';
}

function normalizeCssValue(value: string, fallback: string): string {
  if (!value || typeof value !== 'string') return fallback;
  return value.trim().replace(/\s+/g, ' ') || fallback;
}
