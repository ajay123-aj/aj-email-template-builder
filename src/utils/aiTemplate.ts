import type { EmailTemplate } from '../types/template';

const SCHEMA = `JSON schema (strict):
- Root: { "id": string (UUID), "name"?: string, "width"?: "600px", "padding"?: "24px", "backgroundType"?: "color", "backgroundColor"?: "#ffffff", "sections": array }
- Each section: { "id": string (UUID), "layout"?: "row"|"column", "padding"?: "16px", "backgroundColor"?: string, "columns": array }
- Each column: { "id": string (UUID), "width"?: "50%" (for multi-column), "blocks": array }
- Each block: { "id": string (UUID), "type": one of "header"|"text"|"heading"|"image"|"button"|"divider"|"spacer"|"footer"|"html", "config": object }

Block config:
- header: content, logoUrl?, logoAlt?, height?, fontSize?, color?, alignment?, backgroundColor?, padding?
- text: content, fontSize?, color?, alignment?, fontFamily?, fontWeight?, fontStyle?, padding?, margin?, lineHeight?
- heading: content, level? (1-4), fontSize?, color?, alignment?, fontFamily?, fontWeight?
- image: src, alt?, width?, height?, alignment?
- button: text, href, backgroundColor?, textColor?, borderRadius?, padding?, alignment?
- divider: borderColor?, borderWidth?, margin?, width?
- spacer: height
- footer: content, backgroundColor?, padding?, fontSize?, color?
- html: html (raw HTML string)

Generate UUIDs for every id. Return only the JSON object, no markdown.`;

const SYSTEM_PROMPT = `You are an expert email designer. Create beautiful, colorful, and user-friendly email templates for the AJ Email Template Editor.

Design principles (always follow):
1. Colorful: Use a vibrant, cohesive color palette. Give sections and headers distinct background colors (e.g. light blue #eff6ff, soft purple #f5f3ff, warm gray #f9fafb) and use a strong primary color for buttons (e.g. #3b82f6 blue, #7c3aed violet, #059669 emerald). Avoid flat white-only layouts; add color to header, footer, or alternating sections so the template looks lively and professional.
2. Include template-related images: Add at least one image block where it fits (hero/banner, product, or illustration). Use real placeholder image URLs so the template displays nicely:
   - Hero/banner: https://picsum.photos/600/200 or https://placehold.co/600x200/3b82f6/ffffff?text=Your+Banner
   - Product/feature: https://picsum.photos/400/300 or https://placehold.co/400x300/e0e7ff/4f46e5?text=Image
   - Logo placeholder in header: https://placehold.co/120x40/f3f4f6/6b7280?text=Logo
   Set alt text to describe the image (e.g. "Hero banner", "Product image"). Templates with relevant images look complete and show better in preview.
3. Beautiful: Clear visual hierarchy (heading → subtext → CTA). Generous whitespace. Readable fonts (Arial, Helvetica; 14–16px body, 22–28px headings).
4. Scalable & user-friendly: One idea per section, spacer blocks for rhythm, one primary CTA button, simple footer. Single column when possible for mobile.

Output: Valid JSON only. ${SCHEMA}`;

const HTML_TO_TEMPLATE_PROMPT = `Convert the given email HTML into the AJ Email Template Editor JSON format. Preserve the design: extract colors, fonts, and spacing into block configs. Map structure to sections and blocks (header, heading, text, image, button, divider, footer). For placeholders like ##OTP## keep them in content. Use schema: ${SCHEMA} Return only the JSON object, no markdown.`;

export async function convertHtmlToTemplate(html: string): Promise<EmailTemplate> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  const baseUrl = (import.meta.env.VITE_OPENAI_BASE_URL as string) || 'https://api.openai.com/v1';
  if (!apiKey?.trim()) throw new Error('API key not set');

  const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: (import.meta.env.VITE_OPENAI_MODEL as string) || 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + '\n\n' + HTML_TO_TEMPLATE_PROMPT },
        { role: 'user', content: 'Convert this email HTML into the template JSON format:\n\n' + html.slice(0, 28000) },
      ],
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } })?.error?.message || `API error: ${res.status}`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data?.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('No response from AI');

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : content;
  const parsed = JSON.parse(jsonStr) as unknown;
  if (!parsed || typeof parsed !== 'object' || !Array.isArray((parsed as EmailTemplate).sections)) {
    throw new Error('Invalid template: missing sections array');
  }
  return parsed as EmailTemplate;
}

export async function generateTemplateFromAI(userPrompt: string): Promise<EmailTemplate> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  const baseUrl = (import.meta.env.VITE_OPENAI_BASE_URL as string) || 'https://api.openai.com/v1';
  if (!apiKey?.trim()) {
    throw new Error('API key not set. Add VITE_OPENAI_API_KEY to your .env file.');
  }

  const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: (import.meta.env.VITE_OPENAI_MODEL as string) || 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt || 'Create a colorful welcome email: header with logo image and colored background, a hero/banner image, short intro text, one CTA button, and a footer. Use vibrant colors and include template-related images so the preview looks complete.' },
      ],
      temperature: 0.25,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } })?.error?.message || `API error: ${res.status}`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data?.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('No response from AI');

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : content;
  const parsed = JSON.parse(jsonStr) as unknown;
  if (!parsed || typeof parsed !== 'object' || !Array.isArray((parsed as EmailTemplate).sections)) {
    throw new Error('Invalid template: missing sections array');
  }
  return parsed as EmailTemplate;
}
