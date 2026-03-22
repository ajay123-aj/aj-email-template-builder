# SEO Setup Guide

This app is configured for search engine optimization (SEO). Here's what's included and how to customize it.

## What's Implemented

### 1. Meta Tags (index.html)
- Primary meta: title, description, keywords, author, robots
- Open Graph (Facebook, LinkedIn)
- Twitter cards
- Canonical URL
- Theme color for mobile browsers
- JSON-LD structured data (WebApplication schema)

### 2. Per-Route SEO (react-helmet-async)
- **Home** (`/`): Landing page title and description
- **Editor** (`/editor`): Editor-specific title and description

Each route updates `<title>`, meta description, canonical URL, and Open Graph tags when the user navigates.

### 3. Sitemap & Robots
- `public/sitemap.xml` – Lists `/` and `/editor`
- `public/robots.txt` – Allows all crawlers, references sitemap

### 4. Semantic HTML & Accessibility
- Skip-to-content link for keyboard users
- Proper heading hierarchy (h1, h2)
- `main`, `header`, `footer`, `nav` elements
- `aria-label` on navigation
- `aria-labelledby` on sections

## Before Deployment

### Set Your Domain

1. Add to `.env` or `.env.production`:
   ```
   VITE_SITE_URL=https://yourdomain.com
   ```
   (No trailing slash)

2. Run `npm run build` – the prebuild script will replace `https://yourdomain.com` in `sitemap.xml` and `robots.txt` with your URL.

3. Update `index.html` if needed – replace `https://yourdomain.com` in:
   - `<link rel="canonical">`
   - `og:url`, `og:image`
   - `twitter:url`, `twitter:image`

### Add Open Graph Image

Create a 1200×630px image for social sharing and place it at `public/og-image.png`. Update the `og:image` and `twitter:image` URLs in `index.html` to match your domain.

## Testing

- **Google Rich Results Test**: https://search.google.com/test/rich-results
- **Facebook Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
