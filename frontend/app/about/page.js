import PublicNav from '@/components/PublicNav';
import AboutContent, { aboutJsonLd } from '@/components/AboutContent';

export const metadata = {
  title: 'About',
  description: 'What TicketHandler is, how the AI triage pipeline works, and frequently asked questions.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-paper">
      <PublicNav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd()) }} />
      <main>
        <AboutContent />
      </main>
    </div>
  );
}