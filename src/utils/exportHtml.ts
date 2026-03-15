import type { EmailTemplate, AnyBlock } from '../types/template';
import { getBackgroundStyle } from './backgroundStyle';

function esc(s: string) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function contentToHtml(content: string | undefined): string {
  const raw = (content ?? '').replace(/<br\s*\/?>/gi, '\n');
  return esc(raw).replace(/\n/g, '<br/>');
}

function blockHtml(b: AnyBlock): string {
  const c = b.config as Record<string, unknown>;
  switch (b.type) {
    case 'text':
      return `<p style="margin:${c.margin ?? '0 0 8px'};font-size:${c.fontSize ?? '14px'};color:${c.color ?? '#374151'};text-align:${c.alignment ?? 'left'};font-family:${c.fontFamily ?? 'sans-serif'};font-weight:${c.fontWeight ?? 'normal'};font-style:${c.fontStyle ?? 'normal'};line-height:${c.lineHeight ?? '1.5'};padding:${c.padding ?? '0'};background:${c.backgroundColor ?? 'transparent'};word-wrap:break-word;">${contentToHtml(c.content as string)}</p>`;
    case 'heading': {
      const l = (c.level as number) ?? 2;
      return `<h${l} style="margin:${c.margin ?? '0 0 8px'};font-size:${c.fontSize ?? '24px'};color:${c.color ?? '#111827'};text-align:${c.alignment ?? 'left'};font-family:${c.fontFamily ?? 'sans-serif'};font-weight:${c.fontWeight ?? 'bold'};padding:${c.padding ?? '0'};background:${c.backgroundColor ?? 'transparent'};">${contentToHtml(c.content as string)}</h${l}>`;
    }
    case 'image':
      return `<img src="${esc(String(c.src || ''))}" alt="${esc(String(c.alt || ''))}" width="${c.width ?? '100%'}" style="max-width:100%;height:auto;display:block;" />`;
    case 'button':
      return `<table cellpadding="0" cellspacing="0" border="0" align="${c.alignment ?? 'center'}" style="margin:0 auto;width:auto;"><tr><td style="padding:${c.padding ?? '12px 24px'};background:${c.backgroundColor ?? '#3b82f6'};border-radius:${c.borderRadius ?? '4px'}"><a href="${esc(String(c.href || '#'))}" style="color:${c.textColor ?? '#fff'};text-decoration:none;font-weight:600;display:inline-block;font-size:14px;">${esc((c.text as string) ?? 'Button')}</a></td></tr></table>`;
    case 'divider':
      return `<hr style="border:none;border-top:${c.borderWidth ?? '1px'} solid ${c.borderColor ?? '#e5e7eb'};margin:${c.margin ?? '12px 0'};width:${c.width ?? '100%'};" />`;
    case 'spacer':
      return `<div style="height:${c.height ?? '24px'};line-height:0;font-size:0;"></div>`;
    case 'header': {
      const hasLogo = !!(c.logoUrl as string)?.trim();
      const style = `padding:${c.padding ?? '16px'};background:${c.backgroundColor ?? '#f9fafb'};min-height:${c.height ?? '60px'};font-size:${c.fontSize ?? '28px'};color:${c.color ?? '#111827'};text-align:${c.alignment ?? 'left'};font-weight:${c.fontWeight ?? 'bold'};`;
      const logo = hasLogo ? `<img src="${esc(String(c.logoUrl))}" alt="${esc(String(c.logoAlt || ''))}" style="max-height:48px;width:auto;vertical-align:middle;" />` : '';
      const text = contentToHtml(c.content as string) || 'Header';
      return hasLogo ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="${style}"><tr><td style="vertical-align:middle;width:1%;white-space:nowrap;padding-right:12px">${logo}</td><td style="${style}">${text}</td></tr></table>` : `<div style="${style}">${text}</div>`;
    }
    case 'footer':
      return `<div style="padding:${c.padding ?? '16px'};background:${c.backgroundColor ?? '#f3f4f6'};font-size:${c.fontSize ?? '12px'};color:${c.color ?? '#6b7280'};text-align:center">${contentToHtml(c.content as string)}</div>`;
    case 'html':
      return (c.html as string) ?? '';
    default:
      return '';
  }
}

function colHtml(blocks: AnyBlock[]) { return blocks.map(blockHtml).join(''); }

const RESPONSIVE_STYLE = `
  body, table, td, p, a, h1, h2, h3, h4 { font-family: Arial, Helvetica, sans-serif; -webkit-text-size-adjust: 100%; }
  .email-wrapper { width: 100%; max-width: 100%; }
  img { border: 0; outline: none; text-decoration: none; max-width: 100%; height: auto !important; }
  @media only screen and (max-width: 620px) {
    .email-wrapper { width: 100% !important; min-width: 0 !important; }
    .email-section-inner { padding: 12px !important; }
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
    const pad = section.padding ?? '16px';
    const sbg = getBackgroundStyle(section);
    if (section.columns.length === 0) return '';
    if (layout === 'column' || section.columns.length === 1) {
      return `<tr><td class="email-section-inner" style="padding:${pad};background:${sbg}"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td>${section.columns.map(c => colHtml(c.blocks)).join('')}</td></tr></table></td></tr>`;
    }
    const n = section.columns.length;
    const widths = section.columns.map(c => (!c.width || c.width === 'auto' || c.width === '100%') ? `${100 / n}%` : c.width);
    const cols = section.columns.map((col, i) => `<td class="email-section-row" width="${widths[i]}" valign="top" style="padding:8px">${colHtml(col.blocks)}</td>`).join('');
    return `<tr><td class="email-section-inner" style="padding:${pad};background:${sbg}"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cols}</tr></table></td></tr>`;
  }).join('');

  const mainPad = normalizeCssPadding(template.padding ?? '24px');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="X-UA-Compatible" content="IE=edge"><title>Email</title><style>${RESPONSIVE_STYLE}</style></head><body style="margin:0;padding:0;background:${bg};-webkit-text-size-adjust:100%;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${bg};min-width:100%;"><tr><td align="center" style="padding:16px 0"><table class="email-wrapper" role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:${wCss};max-width:100%;margin:0 auto;background:#fff;"><tr><td class="email-main" style="padding:${mainPad}"><table width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table></td></tr></table></td></tr></table></body></html>`;
}

function normalizeCssPadding(value: string): string {
  if (!value || typeof value !== 'string') return '24px';
  return value.trim().replace(/\s+/g, ' ').replace(/\s*px/gi, 'px').replace(/\s*%/g, '%') || '24px';
}
