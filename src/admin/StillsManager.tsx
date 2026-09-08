import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useCollection } from './useCollection';
import { Field, TextInput, Toggle, ImageField, Modal, Button, inputCls } from './fields';
import { slugify } from './helpers';

const empty = {
  id: '',
  title: '',
  focal_length: '',
  image: '',
  before_image: '',
  category: 'daily',
  accent_color: '',
  published: true,
  sort_order: 0,
};

export const StillsManager: React.FC = () => {
  const { rows, reload, loading, error } = useCollection<any>('stills');
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  const openNew = () => setEditing({ ...empty, sort_order: rows.length });
  const openEdit = (row: any) => setEditing({ ...row });

  const save = async () => {
    if (!editing || !supabase) return;
    setSaving(true);
    const row = {
      ...editing,
      id: editing.id || slugify(editing.title || 'still'),
      before_image: editing.before_image || null,
      accent_color: editing.accent_color || null,
    };
    const { error: err } = await supabase.from('stills').upsert(row);
    if (err) alert(err.message);
    else {
      setEditing(null);
      reload();
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!supabase || !confirm('Delete this still?')) return;
    await supabase.from('stills').delete().eq('id', id);
    reload();
  };

  const togglePublish = async (row: any) => {
    if (!supabase) return;
    await supabase.from('stills').update({ published: !row.published }).eq('id', row.id);
    reload();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-xs text-ink-muted">
          {rows.length} still{rows.length === 1 ? '' : 's'}
        </p>
        <Button onClick={openNew}>+ New still</Button>
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {loading && <p className="text-ink-muted text-sm">Loading…</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {rows.map((row) => (
          <div key={row.id} className="bg-white rounded-2xl border border-border-crisp overflow-hidden">
            <div className="relative">
              <img
                src={row.image}
                alt={row.title}
                referrerPolicy="no-referrer"
                className="w-full aspect-square object-cover"
              />
              <div className="absolute top-2 right-2">
                <Toggle checked={row.published} onChange={() => togglePublish(row)} />
              </div>
            </div>
            <div className="p-3">
              <div className="font-bold text-sm text-ink truncate">{row.title}</div>
              <div className="font-mono text-[10px] text-ink-muted">
                {row.focal_length} · {row.category === 'event' ? 'Event' : 'Daily'}
                {row.before_image ? ' · B/A' : ''}
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="ghost" className="flex-1" onClick={() => openEdit(row)}>
                  Edit
                </Button>
                <Button variant="danger" className="flex-1" onClick={() => remove(row.id)}>
                  Del
                </Button>
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 && !loading && (
          <div className="col-span-full p-8 text-center text-ink-muted text-sm">No stills yet.</div>
        )}
      </div>

      {editing && (
        <Modal title={editing.id ? 'Edit still' : 'New still'} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <Field label="Title">
              <TextInput
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Focal length">
                <TextInput
                  value={editing.focal_length}
                  onChange={(e) => setEditing({ ...editing, focal_length: e.target.value })}
                />
              </Field>
              <Field label="Accent color (optional)">
                <TextInput
                  value={editing.accent_color ?? ''}
                  onChange={(e) => setEditing({ ...editing, accent_color: e.target.value })}
                  placeholder="#0047ff"
                />
              </Field>
            </div>
            <Field label="Category">
              <select
                value={editing.category ?? 'daily'}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                className={inputCls}
              >
                <option value="daily">Daily (日常隨拍)</option>
                <option value="event">Event (活動攝影)</option>
              </select>
            </Field>
            <Field label="Image (after / 完成品)">
              <ImageField value={editing.image} onChange={(url) => setEditing({ ...editing, image: url })} />
            </Field>
            <Field label="Before image (原圖，用於前後對比，可選)">
              <ImageField
                value={editing.before_image ?? ''}
                onChange={(url) => setEditing({ ...editing, before_image: url })}
              />
            </Field>
            <div className="flex items-center justify-between gap-4">
              <Field label="Sort order">
                <TextInput
                  type="number"
                  value={editing.sort_order}
                  onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                  className="w-24"
                />
              </Field>
              <div className="flex items-center gap-2 pt-4">
                <span className="text-xs text-ink-muted font-bold uppercase">Published</span>
                <Toggle checked={editing.published} onChange={(v) => setEditing({ ...editing, published: v })} />
              </div>
            </div>
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
