# ForensicAI - SEO Launch Guide

## Pre-Launch Checklist

### 1. Update Production URLs
Replace `https://forensic-ai.example.com` with your actual domain in:
- `index.html` – Open Graph `og:url`, `og:image`, Twitter meta, canonical
- `public/robots.txt` – Sitemap URL
- `public/sitemap.xml` – All `<loc>` URLs
- `vite.config.ts` – Add `base: '/your-subpath/'` if deploying to a subpath

### 2. Create Social/OG Image
Create `public/og-image.png` (recommended: 1200×630 px) with:
- ForensicAI logo and tagline
- "AI-Powered Forensic Accounting & Fraud Detection"
- Brand colors (blue #3b82f6, dark slate #0f172a)

### 3. Verify Favicon
- `public/favicon.svg` – Letter "A" favicon (already set)
- Test in browser tab and bookmarks

---

## Implemented SEO Assets

| Asset | Location | Purpose |
|-------|----------|---------|
| Meta tags | `index.html` | Title, description, keywords, robots |
| Open Graph | `index.html` | Facebook, LinkedIn sharing |
| Twitter Card | `index.html` | Twitter sharing |
| Canonical URL | `index.html` | Avoid duplicate content |
| Favicon | `public/favicon.svg` | Tab/browser icon |
| robots.txt | `public/robots.txt` | Crawler instructions |
| sitemap.xml | `public/sitemap.xml` | Page discovery |
| Page titles | `PageTitle.tsx` | Per-route `<title>` updates |

---

## Post-Launch

### Google Search Console
1. Add property: [https://search.google.com/search-console](https://search.google.com/search-console)
2. Verify via HTML tag or DNS
3. Submit sitemap: `https://your-domain.com/sitemap.xml`
4. Request indexing for key URLs

### Bing Webmaster Tools
1. Add site: [https://www.bing.com/webmasters](https://www.bing.com/webmasters)
2. Submit sitemap

### Analytics
- Add Google Analytics 4 or Plausible
- Track page views, conversions (sign-ups, exports)

### Performance
- Enable gzip/Brotli compression
- Use CDN for static assets
- Lazy-load non-critical JS
- Optimize Largest Contentful Paint (LCP)

---

## Keywords (Primary)

- forensic accounting software
- AI fraud detection
- CSV financial analysis
- vendor fraud detection
- AP invoice fraud
- compliance audit tool
- threshold evasion detection
- shell vendor detection

---

## Content Recommendations

1. **Landing / Marketing Page** – Add a public marketing page at `/` before login for better crawlability
2. **Blog** – Articles on fraud patterns, CSV best practices, case studies
3. **Schema.org** – Add `WebApplication` or `SoftwareApplication` JSON-LD in `index.html` for rich results

---

## Example JSON-LD (add to index.html `<head>`)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ForensicAI",
  "description": "AI-powered forensic accounting platform for fraud detection in financial data",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web"
}
</script>
```
