import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export default function SEO({ title, description, image, url }: SEOProps) {
  const siteTitle = title ? `${title} | MrDelivery Audit Pro` : 'MrDelivery Audit Pro';
  const siteDesc = description || 'Platformă AI de audit digital pentru restaurante. Analiză SEO, delivery, meniu, social media și plan de creștere pe 90 de zile.';
  const siteImage = image || 'https://mrdelivery.online/og-image.png';
  const siteUrl = url || 'https://mrdelivery.online';

  return (
    <Helmet>
      <title>{siteTitle}</title>
      <meta name="description" content={siteDesc} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDesc} />
      <meta property="og:image" content={siteImage} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={siteDesc} />
      <meta name="twitter:image" content={siteImage} />
      <link rel="canonical" href={siteUrl} />
    </Helmet>
  );
}
