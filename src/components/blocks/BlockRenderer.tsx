import type { AnyBlock } from '../../types/template';
import { getBackgroundStyle, getButtonBackgroundStyle, getDividerBorderStyle } from '../../utils/backgroundStyle';
import { paddingBlockToStyle, isPaddingZero } from '../../utils/paddingUtils';
import { IconImage } from '../icons';

interface Props { block: AnyBlock; selected?: boolean; onPatch: (id: string, config: Record<string, unknown>) => void; }

// Show line breaks in editor: normalize \n and <br> to visual line breaks; on blur we save innerText (with \n).
function contentWithLineBreaks(content: string | undefined, fallback: string) {
  const raw = (content ?? fallback).trim() || fallback;
  const normalized = raw.replace(/<br\s*\/?>/gi, '\n');
  const parts = normalized.split('\n');
  return parts.flatMap((segment, i) => (i < parts.length - 1 ? [segment, <br key={i} />] : [segment]));
}

export function BlockRenderer({ block, selected, onPatch }: Props) {
  const c = block.config as Record<string, unknown>;
  const onBlur = (e: React.FocusEvent<HTMLElement>, key: string) => onPatch(block.id, { ...c, [key]: (e.target as HTMLElement).innerText ?? '' });

  switch (block.type) {
    case 'text':
      return (
        <div contentEditable={selected} suppressContentEditableWarning className="outline-none whitespace-pre-wrap break-words min-h-[1.5em]"
          style={{ fontSize: (c.fontSize as string) ?? '14px', color: (c.color as string) ?? '#374151', textAlign: ((c.alignment as string) ?? 'left') as React.CSSProperties['textAlign'], fontFamily: (c.fontFamily as string) ?? 'Arial, Helvetica, sans-serif', fontWeight: (c.fontWeight as string) === 'bold' ? 'bold' : 'normal', fontStyle: (c.fontStyle as string) === 'italic' ? 'italic' : 'normal', lineHeight: (c.lineHeight as string)?.trim() || '1.5', padding: (c.padding as string) || undefined, backgroundColor: (c.backgroundColor as string) || undefined }}
          onBlur={e => onBlur(e, 'content')}>{contentWithLineBreaks(c.content as string, 'Edit text')}</div>
      );
    case 'heading': {
      const level = ((c.level as number) ?? 2) as 1 | 2 | 3 | 4;
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      return (
        <Tag contentEditable={selected} suppressContentEditableWarning className="outline-none break-words min-h-[1em]"
          style={{ fontSize: (c.fontSize as string) ?? '24px', color: (c.color as string) ?? '#111827', textAlign: ((c.alignment as string) ?? 'left') as React.CSSProperties['textAlign'], fontFamily: (c.fontFamily as string) ?? 'Arial, Helvetica, sans-serif', fontWeight: (c.fontWeight as string) === 'bold' ? 'bold' : 'normal', fontStyle: (c.fontStyle as string) === 'italic' ? 'italic' : 'normal', lineHeight: (c.lineHeight as string)?.trim() || '1.5', margin: 0 }}
          onBlur={e => onBlur(e as React.FocusEvent<HTMLElement>, 'content')}>{contentWithLineBreaks(c.content as string, 'Heading')}</Tag>
      );
    }
    case 'image': {
      const src = (c.src as string)?.trim();
      return (
        <div style={{ textAlign: ((c.alignment as string) ?? 'center') as React.CSSProperties['textAlign'] }}>
          {src ? (
            <img src={src} alt={(c.alt as string) || ''} style={{ maxWidth: '100%', height: (c.height as string) ?? 'auto', width: (c.width as string) ?? '100%' }} draggable={false} />
          ) : (
            <div className="flex items-center justify-center min-h-[120px] bg-slate-100 rounded border border-dashed border-slate-300 [&_svg]:w-12 [&_svg]:h-12 text-black">
              <IconImage />
            </div>
          )}
        </div>
      );
    }
    case 'button': {
      const btnBg = getButtonBackgroundStyle(c as unknown as Parameters<typeof getButtonBackgroundStyle>[0]);
      return (
        <div style={{ textAlign: ((c.alignment as string) ?? 'center') as React.CSSProperties['textAlign'] }}>
          <a href={(c.href as string) || '#'} contentEditable={selected} suppressContentEditableWarning
            className="inline-block no-underline font-semibold"
            style={{ background: btnBg, color: (c.textColor as string) ?? '#fff', borderRadius: (c.borderRadius as string) ?? '4px', padding: (c.padding as string) ?? '12px 24px', fontSize: '14px' }}
            onBlur={e => onPatch(block.id, { ...c, text: (e.target as HTMLElement).innerText ?? '', href: (c.href as string) ?? '#' })}>{(c.text as string) ?? 'Button'}</a>
        </div>
      );
    }
    case 'divider': {
      const borderStyle = getDividerBorderStyle(c as Parameters<typeof getDividerBorderStyle>[0]);
      const isGradient = borderStyle.startsWith('linear-gradient');
      const bw = (c.borderWidth as string) ?? '1px';
      const margin = (c.margin as string) ?? '16px 0';
      const width = (c.width as string) ?? '100%';
      if (isGradient) {
        return <div style={{ height: bw, background: borderStyle, margin, width }} />;
      }
      return <hr style={{ border: 'none', borderTop: `${bw} solid ${borderStyle}`, margin, width }} />;
    }
    case 'spacer':
      return <div style={{ height: (c.height as string) ?? '24px', lineHeight: 0, fontSize: 0 }} />;
    case 'header': {
      const align = (c.alignment as string) ?? 'left';
      const headerPad = paddingBlockToStyle(c.padding as string, '16px');
      const zeroPad = isPaddingZero(c.padding as string);
      return (
        <div style={{
          ...headerPad,
          background: getBackgroundStyle(c as Parameters<typeof getBackgroundStyle>[0]) || '#f9fafb',
          minHeight: zeroPad ? undefined : ((c.height as string) ?? '60px'),
          height: zeroPad ? 'auto' : undefined,
          display: 'flex',
          alignItems: zeroPad ? 'flex-start' : 'center',
          justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
          gap: '12px',
          boxSizing: 'border-box',
        }}>
          {(c.logoUrl as string) && <img src={c.logoUrl as string} alt={(c.logoAlt as string) || 'Logo'} style={{ maxHeight: '48px', width: 'auto' }} draggable={false} />}
          <div contentEditable={selected} suppressContentEditableWarning className="outline-none flex-1" style={{ fontSize: (c.fontSize as string) ?? '28px', color: (c.color as string) ?? '#111827', fontFamily: (c.fontFamily as string) ?? 'Arial, Helvetica, sans-serif', fontWeight: (c.fontWeight as string) === 'bold' ? 'bold' : 'normal', textAlign: align as React.CSSProperties['textAlign'], lineHeight: (c.lineHeight as string)?.trim() || (zeroPad ? 1 : undefined) }} onBlur={e => onBlur(e as React.FocusEvent<HTMLElement>, 'content')}>{contentWithLineBreaks(c.content as string, 'Header')}</div>
        </div>
      );
    }
    case 'footer': {
      const footerPad = paddingBlockToStyle(c.padding as string, '16px');
      return <div style={{ ...footerPad, backgroundColor: (c.backgroundColor as string) ?? '#f3f4f6', fontSize: (c.fontSize as string) ?? '12px', color: (c.color as string) ?? '#6b7280', fontFamily: (c.fontFamily as string) ?? 'Arial, Helvetica, sans-serif', textAlign: 'center' }}>{contentWithLineBreaks(c.content as string, '© Footer')}</div>;
    }
    case 'html':
      return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: (c.html as string) ?? '' }} />;
    case 'table': {
      const rawHeaders = (c.headers as string[]) ?? ['Header 1', 'Header 2'];
      const headers = rawHeaders.length ? rawHeaders : ['Header 1', 'Header 2'];
      const rawRows = (c.rows as string[][]) ?? [];
      const rows = rawRows.filter(r => Array.isArray(r));
      const borderColor = (c.borderColor as string) ?? '#e5e7eb';
      const fontSize = (c.fontSize as string) ?? '14px';
      const align = ((c.alignment as string) ?? 'left') as React.CSSProperties['textAlign'];
      return (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize, textAlign: align }}>
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={i} contentEditable={selected} suppressContentEditableWarning onBlur={e => {
                    const next = [...headers]; next[i] = (e.target as HTMLElement).innerText ?? ''; onPatch(block.id, { ...c, headers: next });
                  }} style={{ border: `1px solid ${borderColor}`, padding: '8px 12px', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} contentEditable={selected} suppressContentEditableWarning onBlur={e => {
                      const next = rows.map((r, i) => i === ri ? [...r] : r);
                      if (!next[ri]) next[ri] = [];
                      next[ri][ci] = (e.target as HTMLElement).innerText ?? '';
                      onPatch(block.id, { ...c, rows: next });
                    }} style={{ border: `1px solid ${borderColor}`, padding: '8px 12px' }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case 'list': {
      const items = (c.items as string[]) ?? ['Item 1', 'Item 2'];
      const listType = (c.listType as 'ul' | 'ol') ?? 'ul';
      const fontSize = (c.fontSize as string) ?? '14px';
      const color = (c.color as string) ?? '#374151';
      const Tag = listType;
      return (
        <Tag style={{ margin: '0 0 8px', paddingLeft: '24px', fontSize, color }}>
          {items.map((item, i) => (
            <li key={i} contentEditable={selected} suppressContentEditableWarning onBlur={e => {
              const next = [...items]; next[i] = (e.target as HTMLElement).innerText ?? ''; onPatch(block.id, { ...c, items: next });
            }} style={{ marginBottom: '4px' }}>{item}</li>
          ))}
        </Tag>
      );
    }
    default:
      return <div className="text-slate-500 text-sm py-2">{block.type}</div>;
  }
}
