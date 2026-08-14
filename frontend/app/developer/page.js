import PublicNav from '@/components/PublicNav';
import DeveloperContent from '@/components/DeveloperContent';
import { breadcrumbJsonLd } from '@/lib/breadcrumbs';

export const metadata = {
  title: 'Developer',
  description: 'About the developer behind TicketHandler — Muhammad Haseeb Ur Rehman.',
};

function developerJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Muhammad Haseeb Ur Rehman',
    jobTitle: 'Full Stack Developer',
    url: 'https://tickethandler-haseeb.vercel.app/developer',
    sameAs: [
      'https://github.com/haseebio',
      'https://linkedin.com/in/haseebio',
      'https://haseebio-portfolio.netlify.app',
    ],
    knowsAbout: ['React.js', 'Next.js', 'Node.js', 'Express.js', 'PostgreSQL', 'MongoDB', 'Docker', 'AI Integration'],
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'University of Punjab, Lahore',
    },
  };
}

const breadcrumbs = breadcrumbJsonLd([
  { name: 'Home', url: 'https://tickethandler-haseeb.vercel.app' },
  { name: 'Developer', url: 'https://tickethandler-haseeb.vercel.app/developer' },
]);

export default function DeveloperPage() {
  return (
    <div className="min-h-screen bg-paper">
      <PublicNav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(developerJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <main>
        <DeveloperContent />
      </main>
    </div>
  );
}