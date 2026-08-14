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

const PAGE_SIZE = 20;

export default function DashboardPage() {
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [budget, setBudget] = useState(null);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadTickets = useCallback(async (status, pageNum) => {
    const params = { page: pageNum, limit: PAGE_SIZE, ...(status ? { status } : {}) };
    const data = await api.getTickets(params);
    setTickets(data?.tickets || []);
    setTotal(data?.total || 0);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadTickets(filter, page), api.getLlmBudget()])
      .then(([, budgetData]) => setBudget(budgetData))
      .finally(() => setLoading(false));
  }, [filter, page, loadTickets]);

  function handleFilterChange(value) {
    setFilter(value);
    setPage(1);
  }

  function handleCreated(ticket) {
    if (page === 1) {
      setTickets((prev) => [ticket, ...prev].slice(0, PAGE_SIZE));
    }
    setTotal((prev) => prev + 1);
    // Triage runs async on the backend — poll once shortly after to pick up the result,
    // and refresh the budget stat at the same time since it just changed too.
    setTimeout(() => {
      loadTickets(filter, page);
      api.getLlmBudget().then(setBudget);
    }, 4000);
  }

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

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
            onClick={() => handleFilterChange(f.value)}
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
        <>
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {tickets.map((ticket, i) => (
                <TicketRow key={ticket.id} ticket={ticket} index={i} />
              ))}
            </AnimatePresence>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="rounded-md border border-line px-3 py-1.5 text-fog transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-fog">
                Page {page} of {totalPages} · {total} tickets
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="rounded-md border border-line px-3 py-1.5 text-fog transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}