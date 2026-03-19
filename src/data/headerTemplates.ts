/** Unique glassmorphism header HTML for each template type - like template card bg */
const glassBase = 'background:rgba(255,255,255,0.12);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,0.2);border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.08);';

export function getHeaderHtml(templateId: string): string {
  const g = glassBase;
  switch (templateId) {
    case 'newsletter':
      return `<div style="padding:24px 20px;${g}margin:12px;text-align:center"><div style="font-size:26px;font-weight:bold;color:#ffffff;letter-spacing:-0.5px;text-shadow:0 1px 2px rgba(0,0,0,0.2)">Tech Weekly</div><div style="font-size:12px;color:rgba(255,255,255,0.9);margin-top:4px;letter-spacing:2px">NEWSLETTER</div></div>`;
    case 'promotion':
      return `<div style="padding:20px;${g}margin:12px;text-align:center"><span style="display:inline-block;background:rgba(254,243,199,0.95);color:#b45309;font-size:14px;font-weight:bold;padding:8px 20px;border-radius:999px;letter-spacing:2px;box-shadow:0 2px 8px rgba(0,0,0,0.1)">⚡ FLASH SALE</span></div>`;
    case 'welcome':
      return `<div style="padding:28px 24px;${g}margin:12px;text-align:center"><div style="font-size:22px;font-weight:bold;color:#ffffff;text-shadow:0 1px 2px rgba(0,0,0,0.2)">Welcome to Our Community</div><div style="font-size:13px;color:rgba(255,255,255,0.9);margin-top:6px">We're glad you're here</div></div>`;
    case 'invoice':
      return `<div style="padding:20px 24px;${g}margin:12px"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="font-size:20px;font-weight:bold;color:#ffffff;text-shadow:0 1px 2px rgba(0,0,0,0.2)">Acme Inc.</td><td style="text-align:right;font-size:18px;font-weight:bold;color:rgba(255,255,255,0.95);letter-spacing:1px">INVOICE</td></tr></table></div>`;
    case 'event':
      return `<div style="padding:24px;${g}margin:12px;text-align:center;border-left:4px solid rgba(255,255,255,0.6)"><div style="font-size:24px;font-weight:bold;color:#ffffff;text-shadow:0 1px 2px rgba(0,0,0,0.2)">Annual Tech Summit 2025</div><div style="font-size:12px;color:rgba(255,255,255,0.9);margin-top:4px">Save the Date</div></div>`;
    case 'announcement':
      return `<div style="padding:20px 24px;${g}margin:12px;text-align:center"><span style="font-size:16px">📢</span> <span style="font-size:18px;font-weight:bold;color:#ffffff;margin-left:6px;text-shadow:0 1px 2px rgba(0,0,0,0.2)">ANNOUNCEMENT</span></div>`;
    case 'product':
      return `<div style="padding:16px 24px;${g}margin:12px"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="font-size:16px;font-weight:600;color:#ffffff;text-shadow:0 1px 2px rgba(0,0,0,0.2)">New Arrival</td><td style="text-align:right;font-size:11px;color:rgba(255,255,255,0.95);letter-spacing:1px">SHOP NOW →</td></tr></table></div>`;
    case 'survey':
      return `<div style="padding:22px;${g}margin:12px;text-align:center"><span style="font-size:28px;margin-right:8px">📋</span><span style="font-size:20px;font-weight:bold;color:#ffffff;text-shadow:0 1px 2px rgba(0,0,0,0.2)">Quick Survey</span></div>`;
    case 'thankyou':
      return `<div style="padding:24px;${g}margin:12px;text-align:center"><span style="font-size:32px;margin-right:8px;color:#fecdd3">✓</span><span style="font-size:22px;font-weight:bold;color:#ffffff;text-shadow:0 1px 2px rgba(0,0,0,0.2)">Thank You</span></div>`;
    default:
      return `<div style="padding:20px;${g}margin:12px;text-align:center;font-size:20px;font-weight:bold">Header</div>`;
  }
}
