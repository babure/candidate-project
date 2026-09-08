import { useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

type ParamDefaults = Record<string, string>;

/**
 * URL search-param state that omits default values from the query string.
 * Updates use replace so filter/sort tweaks don't flood browser history.
 */
export function useUrlQueryState(defaults: ParamDefaults) {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultsRef = useRef(defaults);
  defaultsRef.current = defaults;

  const values = useMemo(() => {
    const defs = defaultsRef.current;
    const next: Record<string, string> = { ...defs };
    for (const key of Object.keys(defs)) {
      const raw = searchParams.get(key);
      if (raw != null && raw !== '') next[key] = raw;
    }
    return next;
  }, [searchParams]);

  const setValues = useCallback(
    (updates: Record<string, string | null | undefined>, options?: { resetPage?: boolean }) => {
      const defs = defaultsRef.current;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(updates)) {
            const fallback = defs[key];
            if (value == null || value === '' || (fallback != null && value === fallback)) {
              next.delete(key);
            } else {
              next.set(key, value);
            }
          }
          if (options?.resetPage) {
            if ((defs.page ?? '1') === '1') next.delete('page');
            else next.set('page', defs.page);
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const clearToDefaults = useCallback(
    (keys?: string[]) => {
      const defs = defaultsRef.current;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const target = keys ?? Object.keys(defs);
          for (const key of target) next.delete(key);
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  return { values, setValues, clearToDefaults, queryString: searchParams.toString() };
}

export function parsePositiveInt(raw: string | undefined, fallback: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) return fallback;
  return n;
}
