import PublicNav from '@/components/PublicNav';

export const metadata = {
  title: 'Developer',
  description: 'About the developer behind TicketHandler.',
};

const LINKS = [
  ['GitHub', 'https://github.com/haseebio'],
  ['Portfolio', 'https://haseebio-portfolio.netlify.app'],
  ['LinkedIn', 'https://www.linkedin.com/in/haseebio'],
  ['Email', 'mailto:haseebur341@gmail.com'],
];

export default function DeveloperPage() {
  return (
    <div className="min-h-screen bg-paper">
      <PublicNav />
      <main className="mx-auto max-w-3xl px-4 pb-16">
        <h1 className="mb-2 text-2xl font-semibold text-ink">Developer</h1>
        <p className="mb-8 text-sm leading-relaxed text-fog">
          Built by Haseeb, a full-stack developer working primarily with React, Node.js/Express,
          and relational and document databases. TicketHandler was built to bring SQL, Docker,
          CI/CD, and automated testing into one project alongside an AI-integrated feature.
        </p>

        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-primary">Links</h2>
        <div className="flex flex-wrap gap-3">
          {LINKS.map(([label, href]) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="rounded-md border border-line bg-surface px-4 py-2 text-sm text-ink transition-colors hover:border-primary hover:text-primary"
            >
              {label}
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}