import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useCollection } from './useCollection';
import { Field, TextInput, TextArea, Modal, Button } from './fields';
import { slugify } from './helpers';

const empty = { id: '', category: '', client: '', description: '', sort_order: 0 };

export const EngagementsManager: React.FC = () => {
  const { rows, reload, loading, error } = useCollection<any>('engagements');
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  const openNew = () => setEditing({ ...empty, sort_order: rows.length });
  const openEdit = (row: any) => setEditing({ ...row });

  const save = async () => {
    if (!editing || !supabase) return;
    setSaving(true);
    const row = { ...editing, id: editing.id || slugify(editing.client || 'engagement') };
    const { error: err } = await supabase.from('engagements').upsert(row);
    if (err) alert(err.message);
    else {
      setEditing(null);
      reload();
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!supabase || !confirm('Delete this engagement?')) return;
    await supabase.from('engagements').delete().eq('id', id);
    reload();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-xs text-ink-muted">
          {rows.length} engagement{rows.length === 1 ? '' : 's'}
        </p>
        <Button onClick={openNew}>+ New engagement</Button>
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {loading && <p className="text-ink-muted text-sm">Loading…</p>}

      <div className="bg-white rounded-2xl border border-border-crisp overflow-hidden">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center gap-3 px-4 py-3 border-b border-border-crisp last:border-0">
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-ink">{row.client}</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-ink-muted truncate">
                {row.category}
              </div>
              <div className="text-xs text-ink-muted truncate">{row.description}</div>
            </div>
            <Button variant="ghost" onClick={() => openEdit(row)}>
              Edit
            </Button>
            <Button variant="danger" onClick={() => remove(row.id)}>
              Del
            </Button>
          </div>
        ))}
        {rows.length === 0 && !loading && (
          <div className="p-8 text-center text-ink-muted text-sm">No engagements yet.</div>
        )}
      </div>

      {editing && (
        <Modal title={editing.id ? 'Edit engagement' : 'New engagement'} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <Field label="Client">
              <TextInput
                value={editing.client}
                onChange={(e) => setEditing({ ...editing, client: e.target.value })}
              />
            </Field>
            <Field label="Category">
              <TextInput
                value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
              />
            </Field>
            <Field label="Description">
              <TextArea
                rows={2}
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </Field>
            <Field label="Sort order">
              <TextInput
                type="number"
                value={editing.sort_order}
                onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                className="w-24"
              />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
