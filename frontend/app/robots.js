export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/about', '/developer'],
        disallow: ['/dashboard'], // behind auth — nothing useful for crawlers to index
      },
    ],
    sitemap: 'https://tickethandler-haseeb.vercel.app/sitemap.xml',
  };
}