'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import StatStrip from '@/components/StatStrip';
import NewTicketForm from '@/components/NewTicketForm';
import TicketRow from '@/components/TicketRow';
import LoadingSpinner from '@/components/LoadingSpinner';

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Open', value: 'open' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
];

export default function DashboardPage() {
  const [tickets, setTickets] = useState([]);
  const [budget, setBudget] = useState(null);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadTickets = useCallback(async (status) => {
    const data = await api.getTickets(status ? { status } : {});
    setTickets(data || []);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadTickets(filter), api.getLlmBudget()])
      .then(([, budgetData]) => setBudget(budgetData))
      .finally(() => setLoading(false));
  }, [filter, loadTickets]);

  function handleCreated(ticket) {
    setTickets((prev) => [ticket, ...prev]);
    // Triage runs async on the backend — poll once shortly after to pick up the result.
    setTimeout(() => loadTickets(filter), 4000);
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-ink">Tickets</h1>
      <p className="mb-6 text-sm text-fog">Incoming tickets, triaged and routed automatically.</p>

      <StatStrip tickets={tickets} budget={budget} />

      <div className="mb-6">
        <NewTicketForm onCreated={handleCreated} />
      </div>

      <div className="mb-4 flex gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              filter === f.value ? 'bg-primary text-white' : 'text-fog hover:bg-surface'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner label="Loading tickets" />
      ) : tickets.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-8 text-center text-sm text-fog">
          No tickets yet — submit one above to see triage in action.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {tickets.map((ticket, i) => (
              <TicketRow key={ticket.id} ticket={ticket} index={i} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
