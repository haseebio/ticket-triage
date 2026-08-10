import PublicNav from '@/components/PublicNav';
import DeveloperContent from '@/components/DeveloperContent';

export const metadata = {
  title: 'Developer',
  description: 'About the developer behind TicketHandler — Muhammad Haseeb Ur Rehman.',
};

export default function DeveloperPage() {
  return (
    <div className="min-h-screen bg-paper">
      <PublicNav />
      <main>
        <DeveloperContent />
      </main>
    </div>
  );
}