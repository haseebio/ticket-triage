import Link from 'next/link';

export default function PublicNav() {
  return (
    <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-6">
      <Link href="/" className="bg-brand-gradient bg-clip-text font-mono text-sm font-semibold tracking-wide text-transparent">
        TICKETHANDLER
      </Link>
      <div className="flex gap-5 text-sm text-fog">
        <Link href="/about" className="hover:text-ink">About</Link>
        <Link href="/developer" className="hover:text-ink">Developer</Link>
        <Link href="/login" className="text-primary hover:underline">Sign in</Link>
      </div>
    </nav>
  );
}