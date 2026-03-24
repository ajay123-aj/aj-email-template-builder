import { useEffect, useRef } from 'react';
import { collectAjEmailEditorLead } from '../utils/leadCollect';

/**
 * Runs once per mount; POSTs lead collect if VITE_LEAD_COLLECT_API_ORIGIN is set.
 * Uses a ref (not module state) so if this component unmounts and remounts in the same session, collect can run again.
 * React StrictMode double-mount deduping is handled inside collectAjEmailEditorLead.
 */
export function LeadCollectInit() {
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void collectAjEmailEditorLead();
  }, []);

  return null;
}
