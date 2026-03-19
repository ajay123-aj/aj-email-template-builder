import { v4 as uuid } from 'uuid';
import type { EmailTemplate, AnyBlock, EmailSection, EmailColumn } from '../types/template';
import { createBlock } from '../blocks/blockRegistry';
import { getHeaderHtml } from './headerTemplates';

function createColumn(blocks: AnyBlock[] = []): EmailColumn {
  return { id: uuid(), width: '100%', blocks };
}

function createSection(blocks: AnyBlock[] = [], layout: 'row' | 'column' = 'row', overrides?: Partial<EmailSection>): EmailSection {
  const section: EmailSection = {
    id: uuid(),
    layout,
    columns: [{ ...createColumn(blocks), width: '100%' }],
    ...overrides,
  };
  return section;
}

function createSectionWithColumns(columnBlocks: AnyBlock[][], overrides?: Partial<EmailSection>): EmailSection {
  const cols = columnBlocks.map((blocks) => ({
    ...createColumn(blocks),
    width: `${100 / columnBlocks.length}%`,
  }));
  return {
    id: uuid(),
    layout: 'row',
    columns: cols,
    ...overrides,
  };
}

function setBlockContent(block: AnyBlock, content: string): void {
  if (block.config && 'content' in block.config) {
    (block.config as { content?: string }).content = content;
  }
}

function setBlockConfig(block: AnyBlock, config: Record<string, unknown>): void {
  Object.assign(block.config, config);
}

function setButtonText(block: AnyBlock, text: string, href = '#'): void {
  const cfg = block.config as { text?: string; href?: string };
  cfg.text = text;
  cfg.href = href;
}

function createGlassHeader(templateId: string): AnyBlock {
  const html = createBlock('html');
  setBlockConfig(html, { html: getHeaderHtml(templateId) });
  return html;
}

export function getMockTemplate(templateId: string): EmailTemplate | null {
  if (templateId === 'blank') return null;

  const base = {
    width: '600px',
    padding: '0',
    backgroundType: 'color' as const,
    backgroundColor: '#f8fafc',
  };

  switch (templateId) {
    case 'newsletter': {
      const h1 = createBlock('heading');
      setBlockContent(h1, 'March 2025 Edition');
      setBlockConfig(h1, { fontSize: '28px', alignment: 'center', color: '#1e293b' });

      const t1 = createBlock('text');
      setBlockContent(t1, 'Your monthly digest of the latest tech news, product updates, and exclusive insights.');
      setBlockConfig(t1, { alignment: 'center', color: '#64748b', fontSize: '15px' });

      const col1 = createBlock('heading');
      setBlockContent(col1, 'Featured: AI Trends');
      setBlockConfig(col1, { level: 3, fontSize: '18px' });
      const col1t = createBlock('text');
      setBlockContent(col1t, 'Discover how AI is transforming industries...');
      setBlockConfig(col1t, { fontSize: '13px' });

      const col2 = createBlock('heading');
      setBlockContent(col2, 'Product Launch');
      setBlockConfig(col2, { level: 3, fontSize: '18px' });
      const col2t = createBlock('text');
      setBlockContent(col2t, 'Introducing our new enterprise features...');
      setBlockConfig(col2t, { fontSize: '13px' });

      const btn = createBlock('button');
      setButtonText(btn, 'Read Full Newsletter');
      setBlockConfig(btn, { backgroundColor: '#2563eb', borderRadius: '8px', padding: '14px 28px' });

      const footer = createBlock('footer');
      setBlockContent(footer, '© 2025 Tech Weekly • Unsubscribe | Privacy');
      setBlockConfig(footer, { backgroundColor: '#1e293b', color: '#94a3b8', padding: '20px' });

      return {
        id: uuid(),
        name: 'Newsletter',
        ...base,
        sections: [
          createSection([createGlassHeader('newsletter')], 'row', { padding: '12px', backgroundType: 'gradient', backgroundGradient: { angle: 135, colors: ['#1e3a8a', '#3b82f6'] } }),
          createSection([h1, t1], 'row', { padding: '32px 24px', backgroundColor: '#ffffff' }),
          createSectionWithColumns([[col1, col1t], [col2, col2t]], { padding: '24px', backgroundColor: '#f1f5f9' }),
          createSection([createBlock('divider'), btn], 'row', { padding: '24px', backgroundColor: '#ffffff' }),
          createSection([footer], 'row', { padding: '0' }),
        ],
      };
    }

    case 'promotion': {
      const h1 = createBlock('heading');
      setBlockContent(h1, '50% OFF Everything');
      setBlockConfig(h1, { fontSize: '36px', alignment: 'center', color: '#b45309' });

      const t1 = createBlock('text');
      setBlockContent(t1, 'Use code SAVE50 at checkout. Limited time only — ends Sunday midnight!');
      setBlockConfig(t1, { alignment: 'center', color: '#78350f', fontSize: '16px' });

      const btn = createBlock('button');
      setButtonText(btn, 'Shop Now →');
      setBlockConfig(btn, { backgroundColor: '#ea580c', borderRadius: '12px', padding: '16px 40px', textColor: '#ffffff' });

      const footer = createBlock('footer');
      setBlockContent(footer, 'Terms apply. While stocks last.');
      setBlockConfig(footer, { backgroundColor: '#fef3c7', color: '#92400e', padding: '16px' });

      return {
        id: uuid(),
        name: 'Promotion',
        ...base,
        backgroundColor: '#fffbeb',
        sections: [
          createSection([createGlassHeader('promotion')], 'row', { padding: '12px', backgroundType: 'gradient', backgroundGradient: { angle: 135, colors: ['#7c2d12', '#ea580c'] } }),
          createSection([h1, t1, createBlock('spacer'), btn], 'row', {
            padding: '40px 24px',
            backgroundType: 'gradient',
            backgroundGradient: { angle: 135, colors: ['#fff7ed', '#ffffff'] },
          }),
          createSection([footer], 'row', { padding: '0' }),
        ],
      };
    }

    case 'welcome': {
      const h1 = createBlock('heading');
      setBlockContent(h1, "You're In! 🎉");
      setBlockConfig(h1, { fontSize: '32px', alignment: 'center', color: '#047857' });

      const t1 = createBlock('text');
      setBlockContent(t1, "Thanks for joining. Here's what you can do next:");
      setBlockConfig(t1, { alignment: 'center', fontSize: '15px' });

      const list = createBlock('list');
      setBlockConfig(list, {
        items: ['Complete your profile', 'Explore our resources', 'Join the community forum'],
        listType: 'ol',
        fontSize: '15px',
      });

      const btn = createBlock('button');
      setButtonText(btn, 'Get Started');
      setBlockConfig(btn, { backgroundColor: '#059669', borderRadius: '8px', padding: '14px 32px' });

      const footer = createBlock('footer');
      setBlockContent(footer, 'Questions? Reply to this email.');
      setBlockConfig(footer, { backgroundColor: '#ecfdf5', color: '#047857', padding: '20px' });

      return {
        id: uuid(),
        name: 'Welcome Email',
        ...base,
        sections: [
          createSection([createGlassHeader('welcome')], 'row', { padding: '12px', backgroundType: 'gradient', backgroundGradient: { angle: 135, colors: ['#065f46', '#059669'] } }),
          createSection([h1, t1, list, btn], 'row', { padding: '32px 24px', backgroundColor: '#ffffff' }),
          createSection([footer], 'row', { padding: '0' }),
        ],
      };
    }

    case 'invoice': {
      const h1 = createBlock('heading');
      setBlockContent(h1, 'Invoice #INV-2025-0847');
      setBlockConfig(h1, { fontSize: '22px', color: '#0f172a' });

      const t1 = createBlock('text');
      setBlockContent(t1, 'Due: March 30, 2025');
      setBlockConfig(t1, { color: '#64748b', fontSize: '14px' });

      const tbl = createBlock('table');
      setBlockConfig(tbl, {
        headers: ['Description', 'Qty', 'Unit Price', 'Amount'],
        rows: [
          ['Premium Plan - Annual', '1', '$299.00', '$299.00'],
          ['Add-on Storage 50GB', '1', '$49.00', '$49.00'],
          ['', '', 'Subtotal', '$348.00'],
          ['', '', 'Tax (10%)', '$34.80'],
          ['', '', 'Total', '$382.80'],
        ],
        borderColor: '#e2e8f0',
        fontSize: '14px',
        alignment: 'left',
      });

      const footer = createBlock('footer');
      setBlockContent(footer, 'Payment due within 14 days. Bank details on request.');
      setBlockConfig(footer, { backgroundColor: '#f1f5f9', color: '#475569', padding: '16px', fontSize: '12px' });

      return {
        id: uuid(),
        name: 'Invoice',
        ...base,
        sections: [
          createSection([createGlassHeader('invoice')], 'row', { padding: '12px', backgroundType: 'gradient', backgroundGradient: { angle: 90, colors: ['#0f172a', '#334155'] } }),
          createSection([h1, t1, createBlock('spacer'), tbl], 'row', { padding: '24px', backgroundColor: '#ffffff' }),
          createSection([footer], 'row', { padding: '0' }),
        ],
      };
    }

    case 'event': {
      const h1 = createBlock('heading');
      setBlockContent(h1, "You're Invited!");
      setBlockConfig(h1, { fontSize: '30px', alignment: 'center', color: '#5b21b6' });

      const t1 = createBlock('text');
      setBlockContent(t1, 'Join us for keynotes, workshops, and networking.\n\n📅 April 15-16, 2025\n📍 Convention Center, San Francisco');
      setBlockConfig(t1, { alignment: 'center', fontSize: '15px', color: '#6b21a8' });

      const btn = createBlock('button');
      setButtonText(btn, 'RSVP Now');
      setBlockConfig(btn, { backgroundColor: '#7c3aed', borderRadius: '10px', padding: '16px 36px' });

      const footer = createBlock('footer');
      setBlockContent(footer, 'Questions? events@company.com');
      setBlockConfig(footer, { backgroundColor: '#f5f3ff', color: '#6b21a8', padding: '20px' });

      return {
        id: uuid(),
        name: 'Event Invite',
        ...base,
        backgroundColor: '#faf5ff',
        sections: [
          createSection([createGlassHeader('event')], 'row', { padding: '12px', backgroundType: 'gradient', backgroundGradient: { angle: 135, colors: ['#4c1d95', '#7c3aed'] } }),
          createSection([h1, t1, createBlock('spacer'), btn], 'row', {
            padding: '36px 24px',
            backgroundType: 'gradient',
            backgroundGradient: { angle: 180, colors: ['#faf5ff', '#ffffff'] },
          }),
          createSection([footer], 'row', { padding: '0' }),
        ],
      };
    }

    case 'announcement': {
      const h1 = createBlock('heading');
      setBlockContent(h1, 'We Have Big News');
      setBlockConfig(h1, { fontSize: '28px', alignment: 'center', color: '#0c4a6e' });

      const t1 = createBlock('text');
      setBlockContent(t1, 'We are excited to announce that we have been acquired by a leading global company. This partnership will help us serve you better with expanded resources and new features.');
      setBlockConfig(t1, { alignment: 'center', fontSize: '15px', color: '#334155' });

      const t2 = createBlock('text');
      setBlockContent(t2, 'Nothing changes for you — your account, data, and pricing remain the same. We will share more details in the coming weeks.');
      setBlockConfig(t2, { alignment: 'center', fontSize: '14px', color: '#64748b' });

      const btn = createBlock('button');
      setButtonText(btn, 'Learn More');
      setBlockConfig(btn, { backgroundColor: '#0284c7', borderRadius: '8px', padding: '12px 24px' });

      const footer = createBlock('footer');
      setBlockContent(footer, '© 2025 Company. All rights reserved.');
      setBlockConfig(footer, { backgroundColor: '#f0f9ff', color: '#0369a1', padding: '16px' });

      return {
        id: uuid(),
        name: 'Announcement',
        ...base,
        sections: [
          createSection([createGlassHeader('announcement')], 'row', { padding: '12px', backgroundType: 'gradient', backgroundGradient: { angle: 135, colors: ['#0c4a6e', '#0284c7'] } }),
          createSection([h1, t1, t2, btn], 'row', { padding: '32px 24px', backgroundColor: '#ffffff' }),
          createSection([footer], 'row', { padding: '0' }),
        ],
      };
    }

    case 'product': {
      const img = createBlock('image');
      setBlockConfig(img, { src: 'https://placehold.co/600x280/7c3aed/ffffff?text=Product+Image', alt: 'Product' });

      const h1 = createBlock('heading');
      setBlockContent(h1, 'Pro Wireless Headphones');
      setBlockConfig(h1, { fontSize: '24px', color: '#581c87' });

      const t1 = createBlock('text');
      setBlockContent(t1, '40-hour battery • Active noise cancellation • Premium sound quality');
      setBlockConfig(t1, { fontSize: '14px', color: '#6b21a8' });

      const col1 = createBlock('text');
      setBlockContent(col1, '✓ Free shipping\n✓ 2-year warranty\n✓ 30-day returns');
      setBlockConfig(col1, { fontSize: '13px' });
      const col2 = createBlock('text');
      setBlockContent(col2, '✓ Premium build\n✓ Bluetooth 5.2\n✓ Multipoint connect');
      setBlockConfig(col2, { fontSize: '13px' });

      const btn = createBlock('button');
      setButtonText(btn, 'Buy Now — $199');
      setBlockConfig(btn, { backgroundColor: '#7c3aed', borderRadius: '10px', padding: '14px 32px' });

      const footer = createBlock('footer');
      setBlockContent(footer, 'Limited stock. Order today.');
      setBlockConfig(footer, { backgroundColor: '#f5f3ff', color: '#6b21a8', padding: '16px' });

      return {
        id: uuid(),
        name: 'Product Showcase',
        ...base,
        backgroundColor: '#faf5ff',
        sections: [
          createSection([createGlassHeader('product')], 'row', { padding: '12px', backgroundType: 'gradient', backgroundGradient: { angle: 135, colors: ['#581c87', '#a855f7'] } }),
          createSection([img], 'row', { padding: '0' }),
          createSection([h1, t1], 'row', { padding: '24px 24px 0', backgroundColor: '#ffffff' }),
          createSectionWithColumns([[col1], [col2]], { padding: '16px 24px', backgroundColor: '#ffffff' }),
          createSection([btn], 'row', { padding: '0 24px 24px', backgroundColor: '#ffffff' }),
          createSection([footer], 'row', { padding: '0' }),
        ],
      };
    }

    case 'survey': {
      const h1 = createBlock('heading');
      setBlockContent(h1, "We'd Love Your Feedback");
      setBlockConfig(h1, { fontSize: '24px', alignment: 'center', color: '#0f766e' });

      const t1 = createBlock('text');
      setBlockContent(t1, 'Help us improve. This takes about 2 minutes.');
      setBlockConfig(t1, { alignment: 'center', fontSize: '14px', color: '#64748b' });

      const list = createBlock('list');
      setBlockConfig(list, {
        items: [
          'How satisfied are you with our product?',
          'Would you recommend us to a friend?',
          'What feature would you like to see next?',
        ],
        listType: 'ul',
        fontSize: '14px',
      });

      const btn = createBlock('button');
      setButtonText(btn, 'Start Survey');
      setBlockConfig(btn, { backgroundColor: '#0d9488', borderRadius: '8px', padding: '14px 28px' });

      const footer = createBlock('footer');
      setBlockContent(footer, 'Your feedback helps us serve you better.');
      setBlockConfig(footer, { backgroundColor: '#ccfbf1', color: '#0f766e', padding: '16px' });

      return {
        id: uuid(),
        name: 'Survey',
        ...base,
        sections: [
          createSection([createGlassHeader('survey')], 'row', { padding: '12px', backgroundType: 'gradient', backgroundGradient: { angle: 135, colors: ['#0e7490', '#0d9488'] } }),
          createSection([h1, t1, list, btn], 'row', { padding: '28px 24px', backgroundColor: '#ffffff' }),
          createSection([footer], 'row', { padding: '0' }),
        ],
      };
    }

    case 'thankyou': {
      const h1 = createBlock('heading');
      setBlockContent(h1, 'Order Confirmed! ✓');
      setBlockConfig(h1, { fontSize: '28px', alignment: 'center', color: '#9f1239' });

      const t1 = createBlock('text');
      setBlockContent(t1, "Thank you for your purchase. We've received your order and will ship it within 2-3 business days.");
      setBlockConfig(t1, { alignment: 'center', fontSize: '15px', color: '#4b5563' });

      const t2 = createBlock('text');
      setBlockContent(t2, 'Order #ORD-88492');
      setBlockConfig(t2, { alignment: 'center', fontSize: '13px', color: '#9ca3af' });

      const btn = createBlock('button');
      setButtonText(btn, 'Track Order');
      setBlockConfig(btn, { backgroundColor: '#be123c', borderRadius: '8px', padding: '12px 24px' });

      const footer = createBlock('footer');
      setBlockContent(footer, 'Need help? support@store.com');
      setBlockConfig(footer, { backgroundColor: '#fff1f2', color: '#9f1239', padding: '20px' });

      return {
        id: uuid(),
        name: 'Thank You',
        ...base,
        backgroundColor: '#fdf2f8',
        sections: [
          createSection([createGlassHeader('thankyou')], 'row', { padding: '12px', backgroundType: 'gradient', backgroundGradient: { angle: 135, colors: ['#9f1239', '#e11d48'] } }),
          createSection([h1, t1, t2, btn], 'row', {
            padding: '36px 24px',
            backgroundType: 'gradient',
            backgroundGradient: { angle: 180, colors: ['#fdf2f8', '#ffffff'] },
          }),
          createSection([footer], 'row', { padding: '0' }),
        ],
      };
    }

    default:
      return null;
  }
}
