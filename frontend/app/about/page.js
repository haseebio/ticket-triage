import PublicNav from '@/components/PublicNav';
import AboutContent, { aboutJsonLd } from '@/components/AboutContent';
import { breadcrumbJsonLd } from '@/lib/breadcrumbs';

export const metadata = {
  title: 'About',
  description: 'What TicketHandler is, how the AI triage pipeline works, and frequently asked questions.',
};

const breadcrumbs = breadcrumbJsonLd([
  { name: 'Home', url: 'https://tickethandler-haseeb.vercel.app' },
  { name: 'About', url: 'https://tickethandler-haseeb.vercel.app/about' },
]);

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-paper">
      <PublicNav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <main>
        <AboutContent />
      </main>
    </div>
  );
}