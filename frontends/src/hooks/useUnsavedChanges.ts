import { useEffect, useRef } from 'react';

/**
 * Warns the user before they leave a page with unsaved edits.
 * Uses the native beforeunload dialog for full-page navigations/refresh and
 * blocks in-app route changes by returning a `requestLeave` guard.
 *
 * @param isDirty Whether the form currently has unsaved changes.
 * @returns a `requestLeave(action)` helper — run `action` only if the user
 *          confirms (or there are no unsaved changes).
 */
export function useUnsavedChanges(isDirty: boolean) {
  const dirtyRef = useRef(isDirty);
  dirtyRef.current = isDirty;

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  return {
    /**
     * Guarded navigation helper. `confirmFn` should return a promise<boolean>
     * (e.g. from useConfirm().confirm). If not dirty, runs immediately.
     */
    requestLeave: async (
      confirmFn: (opts: {
        message: string;
        confirmLabel: string;
        cancelLabel: string;
        tone: 'primary';
      }) => Promise<boolean>,
      action: () => void
    ) => {
      if (!dirtyRef.current) {
        action();
        return;
      }
      const ok = await confirmFn({
        message: 'You have unsaved changes. Leave without saving?',
        confirmLabel: 'Leave',
        cancelLabel: 'Stay',
        tone: 'primary',
      });
      if (ok) action();
    },
  };
}
