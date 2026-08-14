'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export default function RoutingRulesPage() {
  const [rules, setRules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ categoryId: '', assigneeId: '', minPriority: 'low' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function loadAll() {
    const [rulesData, categoriesData, usersData] = await Promise.all([
      api.getRoutingRules(),
      api.getCategories(),
      api.getUsers(),
    ]);
    setRules(rulesData || []);
    setCategories(categoriesData || []);
    setUsers(usersData || []);
  }

  useEffect(() => {
    loadAll().finally(() => setLoading(false));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.categoryId || !form.assigneeId) return;
    setSaving(true);
    setError(null);
    try {
      await api.createRoutingRule(form);
      setForm({ categoryId: '', assigneeId: '', minPriority: 'low' });
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(rule) {
    await api.updateRoutingRule(rule.id, { isActive: !rule.is_active });
    setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, is_active: !r.is_active } : r)));
  }

  async function handleDelete(id) {
    await api.deleteRoutingRule(id);
    setRules((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading) return <LoadingSpinner label="Loading routing rules" />;

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-ink">Routing rules</h1>
      <p className="mb-6 text-sm text-fog">
        Match a ticket&apos;s category and minimum priority to the agent it routes to.
      </p>

      <form
        onSubmit={handleCreate}
        className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-line bg-surface p-4"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-fog">Category</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            className="rounded-md border border-line bg-white px-2.5 py-1.5 text-sm text-ink"
          >
            <option value="">Select…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-fog">Min priority</label>
          <select
            value={form.minPriority}
            onChange={(e) => setForm((f) => ({ ...f, minPriority: e.target.value }))}
            className="rounded-md border border-line bg-white px-2.5 py-1.5 text-sm text-ink"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-fog">Assignee</label>
          <select
            value={form.assigneeId}
            onChange={(e) => setForm((f) => ({ ...f, assigneeId: e.target.value }))}
            className="rounded-md border border-line bg-white px-2.5 py-1.5 text-sm text-ink"
          >
            <option value="">Select…</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-gradient disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Adding…' : 'Add rule'}
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-signal-red">{error}</p>}

      {rules.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-8 text-center text-sm text-fog">
          No routing rules yet — add one above.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-line bg-surface px-4 py-3"
            >
              <div className="text-sm text-ink">
                <span className="font-medium">{rule.category_name}</span>
                <span className="text-fog"> · min {rule.min_priority} · </span>
                <span className="font-medium">{rule.assignee_name || 'Unassigned'}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleActive(rule)}
                  className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                    rule.is_active
                      ? 'border-signal-green text-signal-green'
                      : 'border-line text-fog hover:border-ink hover:text-ink'
                  }`}
                >
                  {rule.is_active ? 'Active' : 'Inactive'}
                </button>
                <button
                  onClick={() => handleDelete(rule.id)}
                  className="text-xs text-fog transition-colors hover:text-signal-red"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}