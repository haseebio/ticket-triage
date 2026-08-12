import LoginForm from '@/components/LoginForm';

export const metadata = {
  title: 'Sign In',
  description: 'Sign in to the TicketHandler dashboard to view, triage, and manage support tickets.',
};

export default function LoginPage() {
  return <LoginForm />;
}