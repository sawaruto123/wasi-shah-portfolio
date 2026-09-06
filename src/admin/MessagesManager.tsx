import React from 'react';
import { supabase } from '../lib/supabase';
import { useCollection } from './useCollection';
import { Button } from './fields';

const SCOPE_LABEL: Record<string, string> = {
  motion: '3D / Motion',
  code: 'Creative Code',
  ai: 'AI Systems',
  brand: 'Brand & Type',
};

export const MessagesManager: React.FC = () => {
  const { rows, reload, loading, error } = useCollection<any>('messages', 'created_at');
  const newestFirst = [...rows].reverse();

  const remove = async (id: string) => {
    if (!supabase || !confirm('Delete this message?')) return;
    await supabase.from('messages').delete().eq('id', id);
    reload();
  };

  const toggleRead = async (row: any) => {
    if (!supabase) return;
    await supabase.from('messages').update({ read: !row.read }).eq('id', row.id);
    reload();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-xs text-ink-muted">
          {rows.length} message{rows.length === 1 ? '' : 's'}
          {rows.filter((r) => !r.read).length > 0 && (
            <span className="text-primary font-bold"> · {rows.filter((r) => !r.read).length} unread</span>
          )}
        </p>
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {loading && <p className="text-ink-muted text-sm">Loading…</p>}

      <div className="space-y-3">
        {newestFirst.map((row) => (
          <div
            key={row.id}
            className={`bg-white rounded-2xl border p-4 ${
              row.read ? 'border-border-crisp' : 'border-primary/40'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-ink">{row.name}</span>
                  <a href={`mailto:${row.email}`} className="font-mono text-xs text-primary hover:underline">
                    {row.email}
                  </a>
                  <span className="px-2 py-0.5 rounded-full bg-surface-warm border border-border-crisp font-mono text-[10px] font-bold uppercase text-ink-muted">
                    {SCOPE_LABEL[row.scope] ?? row.scope}
                  </span>
                </div>
                <p className="text-sm text-ink mt-2 whitespace-pre-wrap">{row.details}</p>
                <p className="font-mono text-[10px] text-ink-muted mt-2">
                  {new Date(row.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Button variant="ghost" onClick={() => toggleRead(row)}>
                  {row.read ? 'Mark unread' : 'Mark read'}
                </Button>
                <Button variant="danger" onClick={() => remove(row.id)}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 && !loading && (
          <div className="p-8 text-center text-ink-muted text-sm bg-white rounded-2xl border border-border-crisp">
            No messages yet. Inquiries submitted from the site's contact form will appear here.
          </div>
        )}
      </div>
    </div>
  );
};
