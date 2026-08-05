import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-sans',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

const SITE_URL = 'https://tickethandler-haseeb.vercel.app';
const SITE_TITLE = 'TicketHandler — AI Support Ticket Triage & Routing';
const SITE_DESCRIPTION =
  'AI-powered support ticket triage system. Automatically categorizes, prioritizes, summarizes, and routes incoming tickets using the Gemini API — built with Next.js, Node.js, and PostgreSQL.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: '%s · TicketHandler',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'AI ticket triage',
    'support ticket automation',
    'Gemini API',
    'ticket routing system',
    'customer support software',
    'Next.js portfolio project',
  ],
  authors: [{ name: 'Haseeb', url: 'https://haseebio-portfolio.netlify.app' }],
  creator: 'Haseeb',
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: 'TicketHandler',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  verification: {
    google: 'vyJycu4ZxnyHOe0ushH5fxzlgsq_62d_o9I2OM0KLk8',
    other: {
      'msvalidate.01': 'C5B69267DEEA4D40FA3765ECD5754B83',
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}