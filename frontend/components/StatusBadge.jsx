const STYLES = {
  open: { label: 'Open', dot: 'bg-primary', text: 'text-primary' },
  in_progress: { label: 'In progress', dot: 'bg-secondary', text: 'text-secondary' },
  resolved: { label: 'Resolved', dot: 'bg-signal-green', text: 'text-signal-green' },
  closed: { label: 'Closed', dot: 'bg-fog', text: 'text-fog' },
  pending: { label: 'Pending triage', dot: 'bg-fog', text: 'text-fog' },
  processing: { label: 'Triaging…', dot: 'bg-secondary', text: 'text-secondary' },
  done: { label: 'Triaged', dot: 'bg-signal-green', text: 'text-signal-green' },
  failed: { label: 'Triage failed', dot: 'bg-signal-red', text: 'text-signal-red' },
  quota_exceeded: { label: 'Quota reached', dot: 'bg-signal-red', text: 'text-signal-red' },
};

export default function StatusBadge({ value }) {
  const style = STYLES[value] || { label: value, dot: 'bg-fog', text: 'text-fog' };

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${style.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}
