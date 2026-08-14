'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

const COLORS = ['#FF6B4A', '#FFC93C', '#6B7280', '#1F2937'];

function formatDay(day) {
  return new Date(day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalyticsSummary().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner label="Loading analytics" />;
  if (!data) return null;

  const overTime = data.overTime.map((d) => ({ ...d, label: formatDay(d.day) }));

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-ink">Analytics</h1>
      <p className="mb-6 text-sm text-fog">A quick read on ticket volume, category mix, and resolution speed.</p>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-section p-4">
          <p className="mb-1 font-mono text-2xl font-bold text-ink">
            {data.byCategory.reduce((sum, c) => sum + c.count, 0)}
          </p>
          <p className="text-xs text-fog">Total tickets</p>
        </div>
        <div className="rounded-lg border border-line bg-section p-4">
          <p className="mb-1 font-mono text-2xl font-bold text-ink">
            {data.avgResolutionHours != null ? `${data.avgResolutionHours}h` : '—'}
          </p>
          <p className="text-xs text-fog">Avg. time to resolution</p>
        </div>
        <div className="rounded-lg border border-line bg-section p-4">
          <p className="mb-1 font-mono text-2xl font-bold text-ink">
            {data.byStatus.find((s) => s.status === 'resolved')?.count ?? 0}
          </p>
          <p className="text-xs text-fog">Resolved</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="mb-4 text-sm font-medium text-ink">Tickets by category</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.byCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.byCategory.map((entry, i) => (
                  <Bar key={entry.category} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="mb-4 text-sm font-medium text-ink">Tickets by status</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.byStatus} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis dataKey="status" type="category" tick={{ fontSize: 12, fill: '#6B7280' }} width={90} />
              <Tooltip />
              <Bar dataKey="count" fill="#FF6B4A" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-line bg-surface p-4">
        <p className="mb-4 text-sm font-medium text-ink">Tickets created — last 14 days</p>
        {overTime.length === 0 ? (
          <p className="py-8 text-center text-sm text-fog">No tickets in the last 14 days.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={overTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#FF6B4A" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}