import { Helmet } from 'react-helmet-async';

const DEFAULT_SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com';

function getBaseUrl(): string {
  const url = import.meta.env.VITE_SITE_URL as string | undefined;
  return url?.trim() || DEFAULT_SITE_URL;
}

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
}

export function SEO({ title, description, path = '', noIndex = false }: SEOProps) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={url} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
