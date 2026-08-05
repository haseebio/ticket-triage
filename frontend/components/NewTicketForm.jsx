'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function NewTicketForm({ onCreated }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const ticket = await api.createTicket({
        subject,
        body,
        requesterEmail: requesterEmail || undefined,
        source: 'form',
      });
      setSubject('');
      setBody('');
      setRequesterEmail('');
      onCreated(ticket);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          placeholder="Subject"
          required
          minLength={3}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="flex-1 rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <input
          type="email"
          placeholder="Your email (optional)"
          value={requesterEmail}
          onChange={(e) => setRequesterEmail(e.target.value)}
          className="sm:w-56 rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-brand-gradient disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Submit ticket'}
        </button>
      </div>
      <textarea
        placeholder="Describe the issue — this is what the AI reads to categorize and prioritize it."
        required
        minLength={10}
        rows={2}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
      />
      {error && <p className="text-sm text-signal-red">{error}</p>}
    </form>
  );
}