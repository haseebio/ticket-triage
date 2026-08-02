export default function StatStrip({ tickets, budget }) {
  const counts = tickets.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  const items = [
    { label: 'Open', value: counts.open || 0 },
    { label: 'In progress', value: counts.in_progress || 0 },
    { label: 'Resolved', value: counts.resolved || 0 },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-line bg-surface p-4">
          <p className="text-xs text-fog">{item.label}</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-ink">{item.value}</p>
        </div>
      ))}
      {budget && (
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-xs text-fog">AI budget today</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-ink">
            {budget.requestsToday}
            <span className="text-sm font-normal text-fog">/{budget.limitPerDay}</span>
          </p>
        </div>
      )}
    </div>
  );
}
