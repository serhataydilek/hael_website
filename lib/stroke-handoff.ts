export const STROKE_HANDOFF_KEY = 'hael-stroke-handoff';

let latched = false;

export function markStrokeHandoff() {
  latched = true;
  try {
    sessionStorage.setItem(STROKE_HANDOFF_KEY, '1');
  } catch {
    return;
  }
}

export function consumeStrokeHandoff() {
  const stored = (() => {
    try {
      return sessionStorage.getItem(STROKE_HANDOFF_KEY) === '1';
    } catch {
      return false;
    }
  })();
  if (stored) {
    try {
      sessionStorage.removeItem(STROKE_HANDOFF_KEY);
    } catch {
      /* ignore */
    }
  }
  return latched || stored;
}

export function clearStrokeHandoff() {
  latched = false;
  try {
    sessionStorage.removeItem(STROKE_HANDOFF_KEY);
  } catch {
    return;
  }
}
