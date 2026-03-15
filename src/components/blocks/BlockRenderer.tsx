import type { AnyBlock } from '../../types/template';

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
          style={{ fontSize: (c.fontSize as string) ?? '14px', color: (c.color as string) ?? '#374151', textAlign: ((c.alignment as string) ?? 'left') as React.CSSProperties['textAlign'], fontFamily: (c.fontFamily as string) ?? 'Arial, Helvetica, sans-serif', fontWeight: (c.fontWeight as string) === 'bold' ? 'bold' : 'normal', fontStyle: (c.fontStyle as string) === 'italic' ? 'italic' : 'normal', padding: (c.padding as string) || undefined, backgroundColor: (c.backgroundColor as string) || undefined }}
          onBlur={e => onBlur(e, 'content')}>{contentWithLineBreaks(c.content as string, 'Edit text')}</div>
      );
    case 'heading': {
      const level = ((c.level as number) ?? 2) as 1 | 2 | 3 | 4;
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      return (
        <Tag contentEditable={selected} suppressContentEditableWarning className="outline-none break-words min-h-[1em]"
          style={{ fontSize: (c.fontSize as string) ?? '24px', color: (c.color as string) ?? '#111827', textAlign: ((c.alignment as string) ?? 'left') as React.CSSProperties['textAlign'], fontFamily: (c.fontFamily as string) ?? 'Arial, Helvetica, sans-serif', fontWeight: (c.fontWeight as string) === 'bold' ? 'bold' : 'normal', fontStyle: (c.fontStyle as string) === 'italic' ? 'italic' : 'normal', margin: 0 }}
          onBlur={e => onBlur(e as React.FocusEvent<HTMLElement>, 'content')}>{contentWithLineBreaks(c.content as string, 'Heading')}</Tag>
      );
    }
    case 'image':
      return (
        <div style={{ textAlign: ((c.alignment as string) ?? 'center') as React.CSSProperties['textAlign'] }}>
          <img src={(c.src as string) || ''} alt={(c.alt as string) || ''} style={{ maxWidth: '100%', height: (c.height as string) ?? 'auto', width: (c.width as string) ?? '100%' }} draggable={false} />
        </div>
      );
    case 'button':
      return (
        <div style={{ textAlign: ((c.alignment as string) ?? 'center') as React.CSSProperties['textAlign'] }}>
          <a href={(c.href as string) || '#'} contentEditable={selected} suppressContentEditableWarning
            className="inline-block no-underline font-semibold"
            style={{ backgroundColor: (c.backgroundColor as string) ?? '#3b82f6', color: (c.textColor as string) ?? '#fff', borderRadius: (c.borderRadius as string) ?? '4px', padding: (c.padding as string) ?? '12px 24px', fontSize: '14px' }}
            onBlur={e => onPatch(block.id, { ...c, text: (e.target as HTMLElement).innerText ?? '', href: (c.href as string) ?? '#' })}>{(c.text as string) ?? 'Button'}</a>
        </div>
      );
    case 'divider':
      return <hr style={{ border: 'none', borderTop: `${(c.borderWidth as string) ?? '1px'} solid ${(c.borderColor as string) ?? '#e5e7eb'}`, margin: (c.margin as string) ?? '16px 0', width: (c.width as string) ?? '100%' }} />;
    case 'spacer':
      return <div style={{ height: (c.height as string) ?? '24px', lineHeight: 0, fontSize: 0 }} />;
    case 'header':
      return (
        <div style={{ padding: (c.padding as string) ?? '16px', backgroundColor: (c.backgroundColor as string) ?? '#f9fafb', minHeight: (c.height as string) ?? '60px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {(c.logoUrl as string) && <img src={c.logoUrl as string} alt={(c.logoAlt as string) || 'Logo'} style={{ maxHeight: '48px', width: 'auto' }} draggable={false} />}
          <div contentEditable={selected} suppressContentEditableWarning className="outline-none flex-1" style={{ fontSize: (c.fontSize as string) ?? '28px', color: (c.color as string) ?? '#111827', fontFamily: (c.fontFamily as string) ?? 'Arial, Helvetica, sans-serif', fontWeight: (c.fontWeight as string) === 'bold' ? 'bold' : 'normal' }} onBlur={e => onBlur(e as React.FocusEvent<HTMLElement>, 'content')}>{contentWithLineBreaks(c.content as string, 'Header')}</div>
        </div>
      );
    case 'footer':
      return <div style={{ padding: (c.padding as string) ?? '16px', backgroundColor: (c.backgroundColor as string) ?? '#f3f4f6', fontSize: (c.fontSize as string) ?? '12px', color: (c.color as string) ?? '#6b7280', fontFamily: (c.fontFamily as string) ?? 'Arial, Helvetica, sans-serif', textAlign: 'center' }}>{contentWithLineBreaks(c.content as string, '© Footer')}</div>;
    case 'html':
      return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: (c.html as string) ?? '' }} />;
    default:
      return <div className="text-slate-500 text-sm py-2">{block.type}</div>;
  }
}
