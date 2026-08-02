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

export const metadata = {
  title: {
    default: 'Triage — AI Support Ticket Routing',
    template: '%s · Triage',
  },
  description:
    'AI-powered support ticket triage: automatic categorization, prioritization, and routing for support teams.',
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
