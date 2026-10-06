// Entry point: CMS first, then routing + theme + mobile menu + modal ESC
import { loadCms } from './store.js';
import { applyBranding, initRouter } from './router.js';

function initTheme(): void {
  const root = document.documentElement;
  const btn = document.getElementById('themeBtn');
  const saved = localStorage.getItem('be-theme');
  if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);
  btn?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('be-theme', next);
    if (btn) btn.textContent = next === 'dark' ? '☀️' : '🌙';
  });
  if (btn && root.getAttribute('data-theme') === 'dark') btn.textContent = '☀️';
}

function initMenu(): void {
  const nav = document.getElementById('mainNav');
  document.getElementById('menuBtn')?.addEventListener('click', () => nav?.classList.toggle('open'));
  nav?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => nav?.classList.remove('open')));
}

function initEsc(): void {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.getElementById('modalBack')?.classList.remove('open');
      document.getElementById('lightbox')?.classList.remove('open');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const cms = loadCms();
  (window as unknown as { __cms?: unknown }).__cms = cms;
  initTheme();
  initMenu();
  initEsc();
  initRouter();
  applyBranding();
});
