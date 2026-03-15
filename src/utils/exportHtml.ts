import type { EmailTemplate, AnyBlock } from '../types/template';
import { getBackgroundStyle } from './backgroundStyle';

function esc(s: string) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function blockHtml(b: AnyBlock): string {
  const c = b.config as Record<string, unknown>;
  switch (b.type) {
    case 'text':
      return `<p style="margin:0 0 12px;font-size:${c.fontSize ?? '14px'};color:${c.color ?? '#374151'};text-align:${c.alignment ?? 'left'};font-family:${c.fontFamily ?? 'sans-serif'};font-weight:${c.fontWeight ?? 'normal'};font-style:${c.fontStyle ?? 'normal'};line-height:${c.lineHeight ?? '1.5'};padding:${c.padding ?? '0'};background:${c.backgroundColor ?? 'transparent'};">${(c.content as string)?.replace(/\n/g, '<br/>') ?? ''}</p>`;
    case 'heading': {
      const l = (c.level as number) ?? 2;
      return `<h${l} style="margin:0 0 12px;font-size:${c.fontSize ?? '24px'};color:${c.color ?? '#111827'};text-align:${c.alignment ?? 'left'};font-family:${c.fontFamily ?? 'sans-serif'};font-weight:${c.fontWeight ?? 'bold'};">${esc((c.content as string) ?? '')}</h${l}>`;
    }
    case 'image':
      return `<img src="${esc(String(c.src || ''))}" alt="${esc(String(c.alt || ''))}" width="${c.width ?? '100%'}" style="max-width:100%;height:auto;display:block;" />`;
    case 'button':
      return `<table cellpadding="0" cellspacing="0" border="0" align="${c.alignment ?? 'center'}" style="margin:0 auto;"><tr><td style="padding:12px 24px;background:${c.backgroundColor ?? '#3b82f6'};border-radius:${c.borderRadius ?? '4px'}"><a href="${esc(String(c.href || '#'))}" style="color:${c.textColor ?? '#fff'};text-decoration:none;font-weight:600">${esc((c.text as string) ?? 'Button')}</a></td></tr></table>`;
    case 'divider':
      return `<hr style="border:none;border-top:${c.borderWidth ?? '1px'} solid ${c.borderColor ?? '#e5e7eb'};margin:16px 0;width:${c.width ?? '100%'};" />`;
    case 'spacer':
      return `<div style="height:${c.height ?? '24px'};line-height:0;font-size:0;"></div>`;
    case 'header': {
      const hasLogo = !!(c.logoUrl as string)?.trim();
      const style = `padding:${c.padding ?? '16px'};background:${c.backgroundColor ?? '#f9fafb'};min-height:${c.height ?? '60px'};font-size:${c.fontSize ?? '28px'};color:${c.color ?? '#111827'};text-align:${c.alignment ?? 'left'};font-weight:${c.fontWeight ?? 'bold'};`;
      const logo = hasLogo ? `<img src="${esc(String(c.logoUrl))}" alt="${esc(String(c.logoAlt || ''))}" style="max-height:48px;width:auto;vertical-align:middle;" />` : '';
      const text = (c.content as string)?.replace(/\n/g, '<br/>') ?? 'Header';
      return hasLogo ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="${style}"><tr><td style="vertical-align:middle;width:1%;white-space:nowrap;padding-right:12px">${logo}</td><td style="${style}">${text}</td></tr></table>` : `<div style="${style}">${text}</div>`;
    }
    case 'footer':
      return `<div style="padding:${c.padding ?? '16px'};background:${c.backgroundColor ?? '#f3f4f6'};font-size:${c.fontSize ?? '12px'};color:${c.color ?? '#6b7280'};text-align:center">${String(c.content ?? '').replace(/\n/g, '<br/>')}</div>`;
    case 'html':
      return (c.html as string) ?? '';
    default:
      return '';
  }
}

function colHtml(blocks: AnyBlock[]) { return blocks.map(blockHtml).join(''); }

export function exportToEmailHtml(template: EmailTemplate): string {
  const w = template.width ?? '600';
  const bg = getBackgroundStyle(template);
  const rows = template.sections.map(section => {
    const layout = section.layout ?? 'row';
    const pad = section.padding ?? '16px';
    const sbg = getBackgroundStyle(section);
    if (section.columns.length === 0) return '';
    if (layout === 'column' || section.columns.length === 1) {
      return `<tr><td style="padding:${pad};background:${sbg}"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td>${section.columns.map(c => colHtml(c.blocks)).join('')}</td></tr></table></td></tr>`;
    }
    const n = section.columns.length;
    const widths = section.columns.map(c => (!c.width || c.width === 'auto' || c.width === '100%') ? `${100 / n}%` : c.width);
    const cols = section.columns.map((col, i) => `<td width="${widths[i]}" valign="top" style="padding:8px">${colHtml(col.blocks)}</td>`).join('');
    return `<tr><td style="padding:${pad};background:${sbg}"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cols}</tr></table></td></tr>`;
  }).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Email</title></head><body style="margin:0;padding:0;background:${bg}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${bg}"><tr><td align="center" style="padding:24px 0"><table class="wrapper" role="presentation" width="${w}" cellpadding="0" cellspacing="0" border="0" style="max-width:100%;margin:0 auto;background:#fff">${rows}</table></td></tr></table></body></html>`;
}
