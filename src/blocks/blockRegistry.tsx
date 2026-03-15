import { v4 as uuid } from 'uuid';
import type { AnyBlock, BlockType } from '../types/template';

const defaults: Record<BlockType, object> = {
  text: { content: 'Edit this text', fontSize: '14px', color: '#374151', alignment: 'left', fontFamily: 'inherit', fontWeight: 'normal', fontStyle: 'normal' },
  heading: { content: 'Heading', level: 2, fontSize: '24px', color: '#111827', alignment: 'left', fontFamily: 'inherit', fontWeight: 'bold', fontStyle: 'normal' },
  image: { src: '', alt: '', width: '100%', height: 'auto', alignment: 'center' },
  button: { text: 'Button', href: '#', backgroundColor: '#3b82f6', textColor: '#fff', alignment: 'center', borderRadius: '4px', padding: '12px 24px' },
  divider: { borderColor: '#e5e7eb', borderWidth: '1px', width: '100%' },
  spacer: { height: '24px' },
  social: { icons: [], alignment: 'center' },
  columns: { count: 2, widths: ['50%', '50%'] },
  header: { content: 'Header', logoUrl: '', logoAlt: 'Logo', height: '60px', fontSize: '28px', fontWeight: 'bold', fontStyle: 'normal', color: '#111827', alignment: 'left', fontFamily: 'inherit', backgroundColor: '#f9fafb', padding: '16px' },
  footer: { content: '© Footer', backgroundColor: '#f3f4f6', padding: '16px', fontSize: '12px', color: '#6b7280' },
  html: { html: '<p>HTML</p>' },
};

export function createBlock(type: BlockType): AnyBlock {
  return { id: uuid(), type, config: { ...defaults[type] } } as AnyBlock;
}

export const BLOCK_LABELS: Record<BlockType, string> = { text: 'Text', heading: 'Heading', image: 'Image', button: 'Button', divider: 'Divider', spacer: 'Spacer', social: 'Social', columns: 'Columns', header: 'Header', footer: 'Footer', html: 'HTML' };
export const PALETTE_ORDER: BlockType[] = ['header', 'text', 'heading', 'image', 'button', 'divider', 'spacer', 'social', 'columns', 'footer', 'html'];
