'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import StatusBadge from './StatusBadge';

const STRIPE = {
  open: 'bg-primary',
  in_progress: 'bg-secondary',
  resolved: 'bg-signal-green',
  closed: 'bg-fog',
};

function formatTimestamp(value) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TicketRow({ ticket, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index, 8) * 0.03 }}
    >
      <Link
        href={`/dashboard/tickets/${ticket.id}`}
        className="grid grid-cols-[3px_1fr_auto_auto_auto] items-center gap-4 overflow-hidden rounded-lg border border-line bg-surface transition-shadow hover:shadow-sm"
      >
        <span className={`h-full self-stretch ${STRIPE[ticket.status] || 'bg-fog'}`} />

        <div className="min-w-0 py-3">
          <p className="truncate text-sm font-medium text-ink">{ticket.subject}</p>
          <p className="truncate font-mono text-xs text-fog">
            #{ticket.id} · {ticket.category_name || 'uncategorized'}
            {ticket.requester_email ? ` · ${ticket.requester_email}` : ''}
          </p>
        </div>

        {ticket.priority && (
          <span className="hidden text-xs font-medium uppercase tracking-wide text-fog sm:inline">
            {ticket.priority}
          </span>
        )}

        <StatusBadge value={ticket.triage_status === 'done' ? ticket.status : ticket.triage_status} />

        <span className="pr-4 font-mono text-xs font-medium text-primary">
          {formatTimestamp(ticket.created_at)}
        </span>
      </Link>
    </motion.div>
  );
}