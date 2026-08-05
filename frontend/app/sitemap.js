const SITE_URL = 'https://tickethandler-haseeb.vercel.app';

export default function sitemap() {
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/login`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/developer`, changeFrequency: 'monthly', priority: 0.6 },
  ];
}