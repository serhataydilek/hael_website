export function isHeroRevealed() {
  if (typeof document === 'undefined') return false;
  if (document.documentElement.dataset.haelHeroRevealed === 'true') return true;
  const hero = document.querySelector('.campaign-hero');
  if (!(hero instanceof HTMLElement)) return false;
  return hero.dataset.haelHeroRevealed === 'true' || hero.dataset.phrase === 'focus' || hero.dataset.phrase === 'gone';
}

export function markHeroRevealed() {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.haelHeroRevealed = 'true';
  const hero = document.querySelector('.campaign-hero');
  if (hero instanceof HTMLElement) hero.dataset.haelHeroRevealed = 'true';
  window.dispatchEvent(new Event('hael-hero-revealed'));
}

export function clearHeroRevealed() {
  if (typeof document === 'undefined') return;
  document.documentElement.removeAttribute('data-hael-hero-revealed');
}
