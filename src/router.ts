// Hash router for 9 routes (8 public + admin)
import type { RoutePath } from './types.js';
import { Views } from './ui.js';
import { renderAdmin, afterAdminRender } from './admin.js';
export const ROUTES: RoutePath[] = ['#/home','#/about','#/programmes','#/staff','#/research','#/resources','#/gallery','#/contact','#/admin'];
export function currentRoute(): RoutePath {
  const h = window.location.hash as RoutePath;
  return (ROUTES as string[]).includes(h) ? h : '#/home';
}
export function applyBranding(): void {
  const s = (window as unknown as { __cms?: { settings: Record<string,string> } }).__cms?.settings;
  if (!s) return;
  const root = document.documentElement;
  if (s.pine) root.style.setProperty('--pine', s.pine);
  if (s.accent) root.style.setProperty('--accent', s.accent);
  const brand = document.querySelector('.brand span span, .brand span');
  void brand;
  const brandName = document.getElementById('brandName');
  if (brandName) brandName.textContent = s.brandName ?? '';
  const brandSub = document.getElementById('brandSub');
  if (brandSub) brandSub.textContent = s.brandSub ?? '';
  const topL = document.getElementById('topLeft');
  if (topL) topL.textContent = s.topLeft ?? '';
  const topR = document.getElementById('topRight');
  if (topR) topR.textContent = s.topRight ?? '';
  const fAcc = document.getElementById('footAccred');
  if (fAcc) fAcc.textContent = s.footerAccred ?? '';
  const fCopy = document.getElementById('footCopy');
  if (fCopy) fCopy.textContent = s.copyright ?? '';
  const fSec = document.getElementById('footSec');
  if (fSec) fSec.textContent = `Security: ${s.emergencySec ?? ''}`;
  const fCli = document.getElementById('footCli');
  if (fCli) fCli.textContent = `Clinic: ${s.emergencyClinic ?? ''}`;
}
export function navigate(): void {
  const app = document.getElementById('app');
  if (!app) return;
  const r = currentRoute();
  if (r === '#/admin') {
    app.innerHTML = renderAdmin();
    document.querySelectorAll('nav.main a').forEach((a) => {
      (a as HTMLAnchorElement).classList.remove('active');
    });
    afterAdminRender();
  } else {
    app.innerHTML = Views[r]();
    document.querySelectorAll('nav.main a').forEach((a) => {
      const link = a as HTMLAnchorElement;
      link.classList.toggle('active', link.getAttribute('href') === r);
    });
    Views.afterRender(r);
  }
  applyBranding();
  window.scrollTo({ top: 0 });
}
export function initRouter(): void {
  window.addEventListener('hashchange', navigate);
  navigate();
}

