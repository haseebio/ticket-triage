export default function LoadingSpinner({ label = 'Loading' }) {
  return (
    <div className="flex items-center gap-2 text-fog text-sm" role="status">
      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-line border-t-primary" />
      {label}
    </div>
  );
}
