import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Loads every row (including drafts) from a table — only usable while
 * authenticated, because RLS restricts full reads to the admin.
 */
export function useCollection<T extends { id: string }>(table: string, orderBy = 'sort_order') {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from(table)
      .select('*')
      .order(orderBy, { ascending: true });
    if (err) setError(err.message);
    else setRows((data ?? []) as T[]);
    setLoading(false);
  }, [table, orderBy]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { rows, setRows, loading, error, reload };
}
