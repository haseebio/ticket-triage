import Link from 'next/link';
import PublicNav from '@/components/PublicNav';

const FEATURES = [
  ['AI categorization', 'Every ticket is read by Gemini and classified by category, priority, and a short summary.'],
  ['Automatic routing', 'Routing rules match a ticket\u2019s category and priority to an assignee, no manual sorting.'],
  ['Budget-aware', 'A built-in usage tracker stops AI calls once a daily limit is hit, instead of erroring out.'],
  ['Full audit trail', 'Every state change — created, triaged, routed, resolved — is logged per ticket.'],
];

export const metadata = {
  title: 'Home',
  description: 'TicketHandler reads every incoming support ticket with the Gemini API, assigns a category and priority, and routes it automatically — a full-stack AI ticket triage system.',
};

function homeJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'TicketHandler',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'AI-powered support ticket triage system that automatically categorizes, prioritizes, summarizes, and routes incoming tickets.',
    url: 'https://tickethandler-haseeb.vercel.app',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: {
      '@type': 'Person',
      name: 'Muhammad Haseeb Ur Rehman',
      url: 'https://tickethandler-haseeb.vercel.app/developer',
    },
  };
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-paper">
      <PublicNav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd()) }} />
      <main className="mx-auto max-w-2xl px-4 pb-20 pt-8 text-center">
        <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
          AI-powered support triage
        </p>
        <h1 className="mb-4 text-3xl font-semibold text-ink sm:text-4xl">
          Support tickets, triaged automatically
        </h1>
        <p className="mx-auto mb-8 max-w-lg text-sm leading-relaxed text-fog">
          TicketHandler reads every incoming ticket with the Gemini API, assigns a category
          and priority, writes a summary for the agent, and routes it to the right person —
          before anyone touches it manually.
        </p>

        <div className="mb-16 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-gradient"
          >
            Sign in to the dashboard
          </Link>
          <Link
            href="/about"
            className="rounded-md border border-line bg-surface px-6 py-2.5 text-sm font-medium text-ink transition-colors hover:border-primary hover:text-primary"
          >
            How it works
          </Link>
        </div>

        <div className="grid gap-3 text-left sm:grid-cols-2">
          {FEATURES.map(([title, desc]) => (
            <div key={title} className="rounded-lg border border-line bg-surface p-4">
              <p className="mb-1 text-sm font-medium text-ink">{title}</p>
              <p className="text-xs text-fog">{desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}