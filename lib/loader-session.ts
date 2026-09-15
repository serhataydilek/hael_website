export function buildLoaderBootScript() {
  return (
    `try{var d=document.documentElement;` +
    `var play=/(?:^|[?&])loader=1(?:&|$)/.test(location.search)||!window.matchMedia('(prefers-reduced-motion: reduce)').matches;` +
    `d.dataset.haelLoaderMode=play?'play':'skip';` +
    `if(play){d.dataset.haelLoaderActive='true'}else{d.removeAttribute('data-hael-loader-active')}` +
    `}catch{}`
  );
}

export function decideLoaderMode(): 'play' | 'skip' {
  if (typeof document !== 'undefined') {
    const mode = document.documentElement.dataset.haelLoaderMode;
    if (mode === 'play' || mode === 'skip') return mode;
  }
  if (typeof window === 'undefined') return 'play';
  try {
    if (new URLSearchParams(window.location.search).get('loader') === '1') return 'play';
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'skip';
  } catch {
    return 'play';
  }
  return 'play';
}
