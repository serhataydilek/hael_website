export function buildLoaderBootScript() {
  return (
    `try{var d=document.documentElement;` +
    `var force=/(?:^|[?&])loader=1(?:&|$)/.test(location.search);` +
    `var reduce=!force&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;` +
    `d.dataset.haelLoaderMode=reduce?'reduce':'play';` +
    `d.dataset.haelLoaderActive='true';` +
    `}catch{}`
  );
}

export function decideLoaderMode(): 'play' | 'reduce' | 'skip' {
  if (typeof document !== 'undefined') {
    const mode = document.documentElement.dataset.haelLoaderMode;
    if (mode === 'play' || mode === 'reduce' || mode === 'skip') return mode;
  }
  if (typeof window === 'undefined') return 'play';
  try {
    if (new URLSearchParams(window.location.search).get('loader') === '1')
      return 'play';
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return 'reduce';
  } catch {
    return 'play';
  }
  return 'play';
}
