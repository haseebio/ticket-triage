import PublicNav from '@/components/PublicNav';

export const metadata = {
  title: 'About',
  description: 'What TicketHandler is and how the AI triage pipeline works.',
};

const FEATURES = [
  ['AI categorization', 'Every ticket is read by Gemini and classified by category, priority, and a short summary.'],
  ['Automatic routing', 'Routing rules match a ticket\u2019s category and priority to an assignee, no manual sorting needed.'],
  ['Budget-aware', 'A built-in usage tracker stops AI calls once a daily/per-minute limit is hit, instead of erroring out.'],
  ['Full audit trail', 'Every state change — created, triaged, routed, resolved — is logged and visible per ticket.'],
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-paper">
      <PublicNav />
      <main className="mx-auto max-w-3xl px-4 pb-16">
        <h1 className="mb-2 text-2xl font-semibold text-ink">About TicketHandler</h1>
        <p className="mb-8 text-sm leading-relaxed text-fog">
          TicketHandler is an AI-powered support ticket triage system. Incoming tickets are
          automatically categorized, prioritized, summarized, and routed to the right agent —
          the parts of support work that are repetitive enough for a model to do reliably,
          so agents spend their time on the parts that actually need a person.
        </p>

        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-primary">Features</h2>
        <div className="mb-8 grid gap-3 sm:grid-cols-2">
          {FEATURES.map(([title, desc]) => (
            <div key={title} className="rounded-lg border border-line bg-surface p-4">
              <p className="mb-1 text-sm font-medium text-ink">{title}</p>
              <p className="text-xs text-fog">{desc}</p>
            </div>
          ))}
        </div>

        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-primary">Built with</h2>
        <p className="text-sm text-fog">
          Next.js, Node.js/Express, PostgreSQL, Docker, GitHub Actions, and the Gemini API —
          deployed on Vercel, Render, and Neon.
        </p>
      </main>
    </div>
  );
}