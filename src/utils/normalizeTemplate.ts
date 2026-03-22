import { v4 as uuid } from 'uuid';
import type { AnyBlock, EmailColumn, EmailSection, EmailTemplate } from '../types/template';

const VALID_BLOCK_TYPES = ['text', 'heading', 'image', 'button', 'divider', 'spacer', 'social', 'columns', 'header', 'footer', 'html', 'table', 'list'] as const;
const VALID_BG_IMAGE_SIZES = ['cover', 'contain', 'auto'] as const;

function normalizeBackgroundImageSize(v: unknown): 'cover' | 'contain' | 'auto' | undefined {
  if (typeof v !== 'string') return undefined;
  return VALID_BG_IMAGE_SIZES.includes(v as (typeof VALID_BG_IMAGE_SIZES)[number]) ? (v as (typeof VALID_BG_IMAGE_SIZES)[number]) : undefined;
}

function ensureBlock(block: unknown): AnyBlock | null {
  if (!block || typeof block !== 'object') return null;
  const b = block as Record<string, unknown>;
  const type = b.type as string;
  if (!VALID_BLOCK_TYPES.includes(type as (typeof VALID_BLOCK_TYPES)[number])) return null;
  const id = typeof b.id === 'string' ? b.id : uuid();
  const config = b.config && typeof b.config === 'object' ? (b.config as Record<string, unknown>) : {};
  return { id, type: type as AnyBlock['type'], config } as AnyBlock;
}

function ensureColumn(col: unknown): EmailColumn | null {
  if (!col || typeof col !== 'object') return null;
  const c = col as Record<string, unknown>;
  const id = typeof c.id === 'string' ? c.id : uuid();
  const rawBlocks = Array.isArray(c.blocks) ? c.blocks : [];
  const blocks: AnyBlock[] = [];
  for (const rb of rawBlocks) {
    const b = ensureBlock(rb);
    if (b) blocks.push(b);
  }
  return { id, width: typeof c.width === 'string' ? c.width : '100%', blocks };
}

function ensureSection(sec: unknown): EmailSection | null {
  if (!sec || typeof sec !== 'object') return null;
  const s = sec as Record<string, unknown>;
  const id = typeof s.id === 'string' ? s.id : uuid();
  const rawColumns = Array.isArray(s.columns) ? s.columns : [];
  const columns: EmailColumn[] = [];
  for (const rc of rawColumns) {
    const col = ensureColumn(rc);
    if (col) columns.push(col);
  }
  if (columns.length === 0) {
    columns.push({ id: uuid(), width: '100%', blocks: [] });
  }
  const bgType = s.backgroundType === 'gradient' ? 'gradient' : s.backgroundType === 'image' ? 'image' : undefined;
  return {
    id,
    layout: (s.layout === 'column' ? 'column' : 'row') as 'row' | 'column',
    padding: typeof s.padding === 'string' ? s.padding : undefined,
    margin: typeof s.margin === 'string' ? s.margin : undefined,
    backgroundType: bgType ?? 'color',
    backgroundColor: typeof s.backgroundColor === 'string' ? s.backgroundColor : undefined,
    backgroundGradient: s.backgroundGradient && typeof s.backgroundGradient === 'object' ? (s.backgroundGradient as object) : undefined,
    backgroundImageUrl: typeof s.backgroundImageUrl === 'string' ? s.backgroundImageUrl : undefined,
    backgroundImageSize: normalizeBackgroundImageSize(s.backgroundImageSize),
    backgroundImagePosition: typeof s.backgroundImagePosition === 'string' ? s.backgroundImagePosition : undefined,
    columns,
  } as EmailSection;
}

/**
 * Normalize an imported JSON template so it has valid structure.
 * Handles malformed or partial exports (e.g. from older versions).
 */
export function normalizeImportedTemplate(raw: unknown): EmailTemplate | null {
  if (!raw || typeof raw !== 'object') return null;
  const t = raw as Record<string, unknown>;
  const rawSections = Array.isArray(t.sections) ? t.sections : [];
  if (rawSections.length === 0) return null;

  const sections: EmailSection[] = [];
  for (const rs of rawSections) {
    const sec = ensureSection(rs);
    if (sec) sections.push(sec);
  }
  if (sections.length === 0) return null;

  return {
    id: typeof t.id === 'string' ? t.id : uuid(),
    name: typeof t.name === 'string' ? t.name : 'Imported template',
    width: typeof t.width === 'string' ? t.width : '600px',
    padding: typeof t.padding === 'string' ? t.padding : '24px 24px 0 24px',
    backgroundType: t.backgroundType === 'gradient' ? 'gradient' : t.backgroundType === 'image' ? 'image' : 'color',
    backgroundColor: typeof t.backgroundColor === 'string' ? t.backgroundColor : '#ffffff',
    backgroundGradient: t.backgroundGradient && typeof t.backgroundGradient === 'object' ? (t.backgroundGradient as object) : undefined,
    backgroundImageUrl: typeof t.backgroundImageUrl === 'string' ? t.backgroundImageUrl : undefined,
    backgroundImageSize: normalizeBackgroundImageSize(t.backgroundImageSize),
    backgroundImagePosition: typeof t.backgroundImagePosition === 'string' ? t.backgroundImagePosition : undefined,
    sections,
  } as EmailTemplate;
}
