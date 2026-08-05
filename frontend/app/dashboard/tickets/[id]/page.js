'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import RoutingTrace from '@/components/RoutingTrace';
import LoadingSpinner from '@/components/LoadingSpinner';

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed'];

export default function TicketDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api.getTicket(id).then(setTicket);
  }, [id]);

  async function handleStatusChange(status) {
    setUpdating(true);
    try {
      const updated = await api.updateTicket(id, { status });
      setTicket((prev) => ({ ...prev, ...updated }));
    } finally {
      setUpdating(false);
    }
  }

  if (!ticket) {
    return <LoadingSpinner label="Loading ticket" />;
  }

  return (
    <div className="max-w-3xl">
      <button onClick={() => router.push('/dashboard')} className="mb-4 text-sm text-fog hover:text-ink">
        ← Back to tickets
      </button>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-fog">#{ticket.id}</p>
          <h1 className="text-xl font-semibold text-ink">{ticket.subject}</h1>
          {ticket.requester_email && (
            <p className="mt-1 text-xs text-fog">From: {ticket.requester_email}</p>
          )}
        </div>
        <StatusBadge value={ticket.status} />
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="rounded-lg border border-primary/30 bg-primary-soft/40 px-4 py-2">
          <p className="text-xs uppercase tracking-wide text-primary">Created</p>
          <p className="font-mono text-sm font-semibold text-ink">
            {new Date(ticket.created_at).toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-surface px-4 py-2">
          <p className="text-xs uppercase tracking-wide text-fog">Resolved</p>
          <p className="font-mono text-sm font-semibold text-ink">
            {ticket.resolved_at ? new Date(ticket.resolved_at).toLocaleString() : 'Not yet resolved'}
          </p>
        </div>
      </div>

      {ticket.triage_status === 'done' && (
        <div className="mb-6">
          <RoutingTrace
            category={ticket.category_name}
            priority={ticket.priority}
            assignee={ticket.assignee_name}
          />
        </div>
      )}

      {ticket.triage_status !== 'done' && (
        <div className="mb-6 rounded-lg border border-dashed border-line p-4 text-sm text-fog">
          <StatusBadge value={ticket.triage_status} />
          {ticket.triage_status === 'quota_exceeded' &&
            ' — the AI budget for today is used up. This ticket will need manual triage.'}
        </div>
      )}

      {ticket.ai_summary && (
        <div className="mb-6 rounded-lg border border-line bg-primary-soft/40 p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-primary">AI summary</p>
          <p className="text-sm text-ink">{ticket.ai_summary}</p>
        </div>
      )}

      <div className="mb-6 rounded-lg border border-line bg-surface p-4">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-fog">Original message</p>
        <p className="whitespace-pre-wrap text-sm text-ink">{ticket.body}</p>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm text-fog">Update status:</span>
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            disabled={updating}
            onClick={() => handleStatusChange(status)}
            className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
              ticket.status === status
                ? 'border-primary bg-primary text-white'
                : 'border-line text-fog hover:border-ink hover:text-ink'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {ticket.history?.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-fog">History</p>
          <ul className="flex flex-col gap-2">
            {ticket.history.map((entry) => (
              <li key={entry.id} className="font-mono text-xs text-fog">
                {new Date(entry.created_at).toLocaleString()} — {entry.actor}: {entry.action}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}