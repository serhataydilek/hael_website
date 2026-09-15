export const DECODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\+-:.#';

export function seedGibberish(text: string) {
  let seed = 2166136261;
  for (let i = 0; i < text.length; i += 1) seed = Math.imul(seed ^ text.charCodeAt(i), 16777619);
  return Array.from(text, (ch, index) => {
    if (ch === ' ' || ch === '\n' || ch === '\t') return ch;
    return DECODE_CHARS[(Math.abs(seed) + index * 31) % DECODE_CHARS.length];
  }).join('');
}

export const DECODE_DURATION = {
  hover: 0.24,
  ui: 0.38,
  label: 0.32,
  cta: 0.36,
  heading: 0.5,
  body: 0.64,
  slogan: 0.78,
} as const;

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function hasFinePointer() {
  return typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export function varyDuration(duration: number) {
  return duration * (0.92 + Math.random() * 0.16);
}

const resolved = new Set<string>();

export function hasDecoded(id: string) {
  if (resolved.has(id)) return true;
  try {
    if (sessionStorage.getItem(`hael-decode:${id}`)) {
      resolved.add(id);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export function markDecoded(id: string) {
  resolved.add(id);
  try {
    sessionStorage.setItem(`hael-decode:${id}`, '1');
  } catch {
    return;
  }
}

let loaderSettled = false;

export function markLoaderSettled() {
  if (loaderSettled) return;
  loaderSettled = true;
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('hael-loader-complete'));
}

export function whenHeroAvailable(onReady: () => void) {
  let settled = false;

  const finish = () => {
    if (settled) return;
    settled = true;
    window.removeEventListener('hael-loader-complete', finish);
    onReady();
  };

  if (loaderSettled || document.documentElement.dataset.haelLoaderMode === 'skip' || !document.querySelector('.opening-screen')) {
    finish();
    return () => {
      settled = true;
    };
  }

  window.addEventListener('hael-loader-complete', finish);
  return () => {
    settled = true;
    window.removeEventListener('hael-loader-complete', finish);
  };
}
