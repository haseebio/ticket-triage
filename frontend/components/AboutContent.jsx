import FaqAccordion from '@/components/FaqAccordion';

const FEATURES = [
  ['AI categorization', 'Every ticket is read by Gemini and classified by category, priority, and a short summary in one structured call.'],
  ['Automatic routing', 'Routing rules match a ticket\u2019s category and priority to an assignee — no manual sorting needed.'],
  ['Budget-aware AI', 'A built-in usage tracker stops AI calls once a daily/per-minute limit is hit, instead of erroring out or overspending.'],
  ['Full audit trail', 'Every state change — created, triaged, routed, resolved — is logged and visible per ticket, with timestamps.'],
];

const STATS = [
  ['5', 'Database tables'],
  ['12', 'Automated tests'],
  ['800', 'Daily AI request cap'],
  ['3', 'Free-tier platforms deployed on'],
];

const STACK = [
  ['Frontend', 'Next.js, Tailwind CSS, Framer Motion'],
  ['Backend', 'Node.js, Express, PostgreSQL'],
  ['Infra', 'Docker, GitHub Actions, Gemini API'],
];

const FAQS = [
  ['What is TicketHandler?', 'An AI-powered support ticket triage system. Incoming tickets are automatically categorized, prioritized, summarized, and routed to an assignee using the Gemini API, instead of being sorted manually.'],
  ['How does the AI categorization work?', 'A ticket\u2019s subject and body are sent to Gemini with a fixed schema requesting a category, priority, and a short summary as structured JSON — not free text that has to be parsed afterward.'],
  ['What happens if the AI usage limit is reached?', 'A budget tracker checks per-minute and per-day request counts before every AI call. Once a limit is hit, the ticket is marked "quota exceeded" instead of failing or retrying silently.'],
  ['How is a ticket routed to an assignee?', 'Routing rules match a ticket\u2019s category and minimum priority to a specific assignee. If nothing matches, the ticket stays unassigned rather than being routed incorrectly.'],
  ['Is this a production tool or a demo?', 'It\u2019s a fully working project — real database, real AI integration, real deployment — built to show a complete stack rather than for production support use.'],
  ['Is ticket data secure?', 'Passwords are hashed with bcrypt, sessions use JWTs, all SQL queries are parameterized, and the API is rate-limited both generally and specifically on the AI-triggering endpoint.'],
];

export function aboutJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}

export default function AboutContent() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-20">
      <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft/50 px-3.5 py-1 text-xs font-semibold text-primary">
        🎫 About TicketHandler
      </span>
      <h1 className="mb-4 text-3xl font-semibold leading-tight text-ink">
        Support triage that runs itself
      </h1>
      <p className="mb-12 max-w-lg text-sm leading-relaxed text-fog">
        TicketHandler is an AI-powered support ticket triage system. Incoming tickets are
        automatically categorized, prioritized, summarized, and routed to the right agent —
        the repetitive parts of support work, done reliably by a model, so agents spend
        their time on what actually needs a person.
      </p>

      <h2 className="mb-4 text-lg font-semibold text-ink">What it does</h2>
      <div className="mb-14 grid gap-3 sm:grid-cols-2">
        {FEATURES.map(([title, desc]) => (
          <div key={title} className="rounded-lg border border-line bg-surface p-4">
            <p className="mb-1.5 text-sm font-medium text-ink">{title}</p>
            <p className="text-xs leading-relaxed text-fog">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mb-14 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary-soft/40 to-secondary/10 p-8">
        <h2 className="mb-3 text-base font-semibold text-ink">Why it matters</h2>
        <p className="text-sm leading-relaxed text-fog">
          Support teams lose real time before any actual work starts — reading each ticket,
          working out what it is, deciding who should handle it. TicketHandler removes that
          step entirely. Tickets are read, understood, and routed the moment they arrive, so
          the first human who opens one is already working with context, not starting cold.
        </p>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-ink">By the numbers</h2>
      <div className="mb-14 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map(([value, label]) => (
          <div key={label} className="rounded-lg border border-line bg-section p-4 text-center">
            <p className="mb-1 bg-brand-gradient bg-clip-text font-mono text-2xl font-bold text-transparent">
              {value}
            </p>
            <p className="text-xs text-fog">{label}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-4 text-lg font-semibold text-ink">Built with</h2>
      <div className="mb-14 grid gap-3 sm:grid-cols-3">
        {STACK.map(([title, desc]) => (
          <div key={title} className="rounded-lg border-t-2 border-t-primary border border-line bg-surface p-4">
            <p className="mb-1.5 text-sm font-semibold text-ink">{title}</p>
            <p className="text-xs leading-relaxed text-fog">{desc}</p>
          </div>
        ))}
      </div>

      <div id="faq">
        <h2 className="mb-1 text-lg font-semibold text-ink">Frequently asked questions</h2>
        <p className="mb-4 text-xs text-fog">Everything you need to know about how it works</p>
        <FaqAccordion items={FAQS} />
      </div>
    </div>
  );
}