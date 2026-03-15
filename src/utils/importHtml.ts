/**
 * Extract email-ready content from a full HTML document for import.
 * Takes only the body content and inlines <style> from head so the design is preserved.
 */
export function extractEmailContent(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return '<p></p>';

  try {
    const doc = new DOMParser().parseFromString(trimmed, 'text/html');
    const head = doc.head;
    const body = doc.body;

    // Collect styles from <head> so the design (e.g. gradients, fonts) is preserved
    const styleBlocks: string[] = [];
    if (head) {
      head.querySelectorAll('style').forEach((el) => {
        const text = el.textContent?.trim();
        if (text) styleBlocks.push(`<style>${text}</style>`);
      });
    }

    // Use body content only; avoid nesting full document inside the editor
    let bodyHtml = body?.innerHTML?.trim() ?? '';

    // If the file was a fragment (no html/body), use the whole thing
    if (!bodyHtml && !trimmed.toLowerCase().includes('<body')) {
      bodyHtml = trimmed;
    }
    if (!bodyHtml) return '<p></p>';

    // Remove script tags for security
    const div = doc.createElement('div');
    div.innerHTML = bodyHtml;
    div.querySelectorAll('script').forEach((s) => s.remove());
    bodyHtml = div.innerHTML.trim();

    return styleBlocks.length > 0 ? styleBlocks.join('\n') + bodyHtml : bodyHtml;
  } catch {
    return trimmed;
  }
}
