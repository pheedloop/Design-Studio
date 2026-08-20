import { useState, useCallback } from "react";

const MAX_HISTORY = 40;

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useHistory<T>(initialPresent: T) {
  const [state, setState] = useState<HistoryState<T>>({
    past: [],
    present: initialPresent,
    future: [],
  });

  const set = useCallback((action: T | ((prev: T) => T)) => {
    setState(prev => {
      const newPresent =
        typeof action === "function"
          ? (action as (prev: T) => T)(prev.present)
          : action;

      return {
        past: [...prev.past, prev.present].slice(-MAX_HISTORY),
        present: newPresent,
        future: [],
      };
    });
  }, []);

  /** Update present without pushing to undo stack. Use for live previews (e.g. slider dragging). */
  const replace = useCallback((action: T | ((prev: T) => T)) => {
    setState(prev => {
      const newPresent =
        typeof action === "function"
          ? (action as (prev: T) => T)(prev.present)
          : action;
      return { ...prev, present: newPresent };
    });
  }, []);

  const undo = useCallback(() => {
    setState(prev => {
      if (prev.past.length === 0) return prev;
      const newPast = [...prev.past];
      const newPresent = newPast.pop()!;
      return {
        past: newPast,
        present: newPresent,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.future.length === 0) return prev;
      const newFuture = [...prev.future];
      const newPresent = newFuture.shift()!;
      return {
        past: [...prev.past, prev.present],
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  return {
    present: state.present,
    set,
    replace,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}
