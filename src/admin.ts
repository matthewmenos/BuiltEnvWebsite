// Admin Dashboard: full CMS CRUD for EVERYTHING on the public site.
// Login gate (password configurable in Settings), section editors,
// JSON export/import, reset-to-seed. Persists to localStorage via store.ts.
import type { SiteSettings } from './types.js';
import { getCms, resetCms, replaceState, saveCms, seedState, uid } from './store.js';

type AdminTab = 'Overview' | 'Settings' | 'Programmes' | 'Staff' | 'Research' | 'News' | 'Events' | 'Resources' | 'Gallery' | 'Inbox' | 'Backup';

const TABS: AdminTab[] = ['Overview', 'Settings', 'Programmes', 'Staff', 'Research', 'News', 'Events', 'Resources', 'Gallery', 'Inbox', 'Backup'];
let tab: AdminTab = 'Overview';

function esc(s: unknown): string { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
function isAuthed(): boolean { return sessionStorage.getItem('be-admin') === '1'; }

export function renderAdmin(): string {
  if (!isAuthed()) {
    return `<section class="section"><span class="eyebrow">Restricted</span><h1>Admin Login</h1>
    <div class="card" style="max-width:440px"><p class="muted">Default password: <code>admin123</code> (change it in Settings after login).</p>
    <form id="adminLogin"><p><label class="fl">Password<input id="adminPass" type="password" autocomplete="current-password"/></label></p>
    <p class="form-err" id="adminErr"></p><button class="btn btn-primary" type="submit">Unlock Dashboard</button></form></div></section>`;
  }
  const cms = getCms();
  return `<section class="section"><span class="eyebrow">CMS</span><h1>Admin Dashboard</h1>
  <p class="muted">Everything here updates the live site instantly. No code edits needed.</p>
  <div class="admin"><div class="admin-side" id="adminTabs">${TABS.map((t) => `<button data-atab="${t}" class="${t === tab ? 'on' : ''}">${t}${t === 'Inbox' && cms.inbox.length ? ` (${cms.inbox.length})` : ''}</button>`).join('')}
  <button id="adminLock">🔒 Lock</button><a class="btn btn-ghost" href="#/home" style="text-align:center">View Site</a></div>
  <div class="admin-grid" id="adminBody">${adminBody()}</div></div></section>`;
}
//__ADMIN2__
let editId: string | null = null;

function val(id: string): string {
  const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
  return el ? el.value.trim() : '';
}
function listParse(v: string): string[] {
  return v.split(/\n|;/).map((s) => s.trim()).filter(Boolean);
}
function syncWin(): void {
  const cms = getCms();
  (window as unknown as { __cms?: unknown }).__cms = cms;
  const r = document.documentElement;
  if (cms.settings.pine) r.style.setProperty('--pine', cms.settings.pine);
  if (cms.settings.accent) r.style.setProperty('--accent', cms.settings.accent);
}
function refresh(): void {
  syncWin();
  const app = document.getElementById('app');
  if (app) { app.innerHTML = renderAdmin(); afterAdminRender(); }
}

function adminBody(): string {
  switch (tab) {
    case 'Settings': return admSettings();
    case 'Programmes': return admProgrammes();
    case 'Staff': return admStaff();
    case 'Research': return admPapers();
    case 'News': return admNews();
    case 'Events': return admEvents();
    case 'Resources': return admResources();
    case 'Gallery': return admGallery();
    case 'Inbox': return admInbox();
    case 'Backup': return admBackup();
    default: return admOverview();
  }
}

function admOverview(): string {
  const cms = getCms();
  const kpi = (n: number, l: string): string => `<div class="kpi"><b>${n}</b><span>${l}</span></div>`;
  return `<div class="kpis">${kpi(cms.programmes.length, 'Programmes')}${kpi(cms.staff.length, 'Staff')}
  ${kpi(cms.papers.length, 'Papers')}${kpi(cms.news.length, 'News')}
  ${kpi(cms.events.length, 'Events')}${kpi(cms.resources.length, 'Resources')}
  ${kpi(cms.gallery.length, 'Gallery')}${kpi(cms.inbox.length, 'Inbox')}</div>
  <div class="card"><h3>How it works</h3>
  <p class="muted">Every word, card and list on the public site comes from this dashboard and is saved in this browser (localStorage key <code>be-cms-v1</code>). Use Backup → Export to move content to another machine.</p>
  <p><button class="btn btn-primary btn-sm" data-goto="Settings">Edit site text</button>
  <button class="btn btn-ghost btn-sm" data-goto="Inbox">View inbox (${cms.inbox.length})</button></p></div>
  <div class="card"><h3>Latest inquiries</h3>${cms.inbox.length ? cms.inbox.slice(0, 3).map((m) =>
    `<p><strong>${esc(m.name)}</strong> <span class="muted">${esc(m.email)} · ${esc(m.date)}</span><br/>${esc(m.message).slice(0, 120)}</p>`).join('') : '<p class="muted">No messages yet.</p>'}</div>`;
}
//__ADMIN3__
function field(label: string, key: keyof SiteSettings, kind: 'text' | 'area' | 'color' = 'text'): string {
  const v = esc(String(getCms().settings[key] ?? ''));
  const input = kind === 'area'
    ? `<textarea id="s-${key}" rows="3">${v}</textarea>`
    : `<input id="s-${key}" type="${kind === 'color' ? 'color' : 'text'}" value="${v}"/>`;
  return `<label class="fl">${label}${input}</label>`;
}
function admSettings(): string {
  const cms = getCms();
  const hodOpts = cms.staff.map((s) => `<option value="${s.id}"${cms.settings.hodId === s.id ? ' selected' : ''}>${esc(s.name)}</option>`).join('');
  return `<div class="card"><h3>Site text & branding</h3><div class="form-grid">
  ${field('Brand name', 'brandName')}${field('Brand sub', 'brandSub')}
  ${field('Top bar left', 'topLeft')}${field('Top bar right', 'topRight')}
  ${field('Hero kicker', 'heroKicker')}<label class="fl">HOD<select id="s-hodId">${hodOpts}</select></label>
  ${field('Hero title', 'heroTitle', 'area')}${field('Hero subtitle', 'heroSub', 'area')}
  ${field('CTA 1 label', 'cta1Label')}${field('CTA 1 link', 'cta1Href')}
  ${field('CTA 2 label', 'cta2Label')}${field('CTA 2 link', 'cta2Href')}
  ${field('HOD section title', 'hodSectionTitle')}${field('HOD quote', 'hodQuote')}
  ${field('History', 'history', 'area')}${field('Vision', 'vision', 'area')}
  ${field('Mission', 'mission', 'area')}${field('Map label (HTML allowed)', 'mapLabel', 'area')}
  ${field('Phone', 'phone')}${field('Email', 'email')}
  ${field('Address', 'address')}${field('Office hours', 'hours')}
  ${field('Footer accreditation', 'footerAccred')}${field('Copyright', 'copyright')}
  ${field('LinkedIn URL', 'socialLinkedIn')}${field('X URL', 'socialX')}
  ${field('YouTube URL', 'socialYouTube')}${field('Emergency security', 'emergencySec')}
  ${field('Emergency clinic', 'emergencyClinic')}${field('Admin password', 'adminPass')}
  ${field('Primary color', 'pine', 'color')}${field('Accent color', 'accent', 'color')}
  </div><p><button class="btn btn-primary" id="saveSettings">Save settings</button> <span class="form-ok" id="setOk"></span></p></div>`;
}
function rowBtns(id: string): string {
  return `<div class="rowbtns"><button class="btn btn-ghost btn-sm" data-edit="${id}">Edit</button><button class="btn btn-danger btn-sm" data-del="${id}">Delete</button></div>`;
}
function admProgrammes(): string {
  const cms = getCms();
  const p = editId ? cms.programmes.find((x) => x.id === editId) : undefined;
  const table = cms.programmes.map((x) =>
    `<tr><td><strong>${esc(x.title)}</strong><br/><span class="muted">${esc(x.unit)} · ${esc(x.level)}</span></td><td>${esc(x.duration)}</td><td>${rowBtns(x.id)}</td></tr>`).join('');
  return `<div class="card"><h3>${p ? 'Edit programme' : 'Add programme'}</h3><div class="form-grid">
  <label class="fl">Title<input id="f-title" value="${esc(p?.title ?? '')}"/></label>
  <label class="fl">Unit<input id="f-unit" value="${esc(p?.unit ?? '')}" placeholder="e.g. Quantity Surveying"/></label>
  <label class="fl">Level<input id="f-level" value="${esc(p?.level ?? '')}" placeholder="Undergraduate / Postgraduate / Diploma"/></label>
  <label class="fl">Duration<input id="f-duration" value="${esc(p?.duration ?? '')}"/></label>
  <label class="fl full">Summary<textarea id="f-summary" rows="2">${esc(p?.summary ?? '')}</textarea></label>
  <label class="fl full">Entry requirements (one per line)<textarea id="f-entry" rows="3">${esc((p?.entryRequirements ?? []).join('\n'))}</textarea></label>
  <label class="fl full">Modules (one per line)<textarea id="f-modules" rows="3">${esc((p?.modules ?? []).join('\n'))}</textarea></label>
  <label class="fl full">Careers (one per line)<textarea id="f-careers" rows="2">${esc((p?.careers ?? []).join('\n'))}</textarea></label>
  <label class="fl">Badge<input id="f-badge" value="${esc(p?.badge ?? '')}"/></label>
  </div><p><button class="btn btn-primary" id="saveProg">${p ? 'Update' : 'Add'} programme</button>
  ${p ? '<button class="btn btn-ghost" id="cancelEdit">Cancel</button>' : ''}</p></div>
  <div class="card"><h3>All programmes (${cms.programmes.length})</h3><table class="table"><tbody>${table || '<tr><td>No programmes yet.</td></tr>'}</tbody></table></div>`;
}
//__ADMIN4__
function admStaff(): string {
  const cms = getCms();
  const m = editId ? cms.staff.find((x) => x.id === editId) : undefined;
  const table = cms.staff.map((x) =>
    `<tr><td><strong>${esc(x.name)}</strong><br/><span class="muted">${esc(x.title)} · ${esc(x.department)}</span></td><td>${esc(x.type)}</td><td>${rowBtns(x.id)}</td></tr>`).join('');
  return `<div class="card"><h3>${m ? 'Edit staff' : 'Add staff'}</h3><div class="form-grid">
  <label class="fl">Name<input id="f-name" value="${esc(m?.name ?? '')}"/></label>
  <label class="fl">Title<input id="f-title2" value="${esc(m?.title ?? '')}"/></label>
  <label class="fl">Letters<input id="f-letters" value="${esc(m?.letters ?? '')}"/></label>
  <label class="fl">Role<input id="f-role" value="${esc(m?.role ?? '')}"/></label>
  <label class="fl">Type<input id="f-type" value="${esc(m?.type ?? 'Academic')}"/></label>
  <label class="fl">Department<input id="f-dept" value="${esc(m?.department ?? '')}"/></label>
  <label class="fl">Email<input id="f-email" value="${esc(m?.email ?? '')}"/></label>
  <label class="fl">Phone<input id="f-phone" value="${esc(m?.phone ?? '')}"/></label>
  <label class="fl">Initials<input id="f-initials" value="${esc(m?.initials ?? '')}"/></label>
  <label class="fl">Photo URL<input id="f-photo" value="${esc(m?.photo ?? '')}"/></label>
  <label class="fl full">Specialties (one per line)<textarea id="f-spec" rows="2">${esc((m?.specialty ?? []).join('\n'))}</textarea></label>
  <label class="fl full">Bio<textarea id="f-bio" rows="3">${esc(m?.bio ?? '')}</textarea></label>
  <label class="fl full">Publications (one per line)<textarea id="f-pubs" rows="2">${esc((m?.publications ?? []).join('\n'))}</textarea></label>
  </div><p><button class="btn btn-primary" id="saveStaff">${m ? 'Update' : 'Add'} member</button>
  ${m ? '<button class="btn btn-ghost" id="cancelEdit">Cancel</button>' : ''}</p></div>
  <div class="card"><h3>All staff (${cms.staff.length})</h3><table class="table"><tbody>${table}</tbody></table></div>`;
}
function admPapers(): string {
  const cms = getCms();
  const p = editId ? cms.papers.find((x) => x.id === editId) : undefined;
  const table = cms.papers.map((x) =>
    `<tr><td><strong>${esc(x.title)}</strong><br/><span class="muted">${esc(x.cluster)} · ${x.year} · ↓${x.downloads}</span></td><td>${rowBtns(x.id)}</td></tr>`).join('');
  return `<div class="card"><h3>${p ? 'Edit paper' : 'Add paper'}</h3><div class="form-grid">
  <label class="fl full">Title<input id="f-ptitle" value="${esc(p?.title ?? '')}"/></label>
  <label class="fl">Cluster<input id="f-cluster" value="${esc(p?.cluster ?? '')}"/></label>
  <label class="fl">Year<input id="f-year" type="number" value="${p?.year ?? new Date().getFullYear()}"/></label>
  <label class="fl">Journal<input id="f-journal" value="${esc(p?.journal ?? '')}"/></label>
  <label class="fl">DOI<input id="f-doi" value="${esc(p?.doi ?? '')}"/></label>
  <label class="fl">Downloads<input id="f-dls" type="number" value="${p?.downloads ?? 0}"/></label>
  <label class="fl full">Authors (one per line)<textarea id="f-authors" rows="2">${esc((p?.authors ?? []).join('\n'))}</textarea></label>
  <label class="fl full">Abstract<textarea id="f-abstract" rows="3">${esc(p?.abstract ?? '')}</textarea></label>
  </div><p><button class="btn btn-primary" id="savePaper">${p ? 'Update' : 'Add'} paper</button>
  ${p ? '<button class="btn btn-ghost" id="cancelEdit">Cancel</button>' : ''}</p></div>
  <div class="card"><h3>All papers (${cms.papers.length})</h3><table class="table"><tbody>${table}</tbody></table></div>`;
}
function admNews(): string {
  const cms = getCms();
  const n = editId ? cms.news.find((x) => x.id === editId) : undefined;
  const table = cms.news.map((x) =>
    `<tr><td><strong>${esc(x.title)}</strong><br/><span class="muted">${esc(x.category)} · ${esc(x.date)}</span></td><td>${rowBtns(x.id)}</td></tr>`).join('');
  return `<div class="card"><h3>${n ? 'Edit article' : 'Add article'}</h3><div class="form-grid">
  <label class="fl full">Title<input id="f-ntitle" value="${esc(n?.title ?? '')}"/></label>
  <label class="fl">Date<input id="f-ndate" value="${esc(n?.date ?? '')}"/></label>
  <label class="fl">Category<input id="f-ncat" value="${esc(n?.category ?? '')}"/></label>
  <label class="fl full">Summary<textarea id="f-nsum" rows="2">${esc(n?.summary ?? '')}</textarea></label>
  <label class="fl full">Body (one paragraph per line)<textarea id="f-nbody" rows="4">${esc((n?.body ?? []).join('\n'))}</textarea></label>
  </div><p><button class="btn btn-primary" id="saveNews">${n ? 'Update' : 'Add'} article</button>
  ${n ? '<button class="btn btn-ghost" id="cancelEdit">Cancel</button>' : ''}</p></div>
  <div class="card"><h3>All articles (${cms.news.length})</h3><table class="table"><tbody>${table}</tbody></table></div>`;
}
//__ADMIN5__
function admEvents(): string {
  const cms = getCms();
  const e = editId ? cms.events.find((x) => x.id === editId) : undefined;
  const table = cms.events.map((x) =>
    `<tr><td><strong>${esc(x.title)}</strong><br/><span class="muted">${esc(x.date)} · ${esc(x.tag)}</span></td><td>${rowBtns(x.id)}</td></tr>`).join('');
  return `<div class="card"><h3>${e ? 'Edit event' : 'Add event'}</h3><div class="form-grid">
  <label class="fl full">Title<input id="f-etitle" value="${esc(e?.title ?? '')}"/></label>
  <label class="fl">Date<input id="f-edate" value="${esc(e?.date ?? '')}"/></label>
  <label class="fl">Time<input id="f-etime" value="${esc(e?.time ?? '')}"/></label>
  <label class="fl">Location<input id="f-eloc" value="${esc(e?.location ?? '')}"/></label>
  <label class="fl">Tag<input id="f-etag" value="${esc(e?.tag ?? '')}"/></label>
  <label class="fl full">Description<textarea id="f-edesc" rows="2">${esc(e?.description ?? '')}</textarea></label>
  </div><p><button class="btn btn-primary" id="saveEvent">${e ? 'Update' : 'Add'} event</button>
  ${e ? '<button class="btn btn-ghost" id="cancelEdit">Cancel</button>' : ''}</p></div>
  <div class="card"><h3>All events (${cms.events.length})</h3><table class="table"><tbody>${table}</tbody></table></div>`;
}
function admResources(): string {
  const cms = getCms();
  const r = editId ? cms.resources.find((x) => x.id === editId) : undefined;
  const table = cms.resources.map((x) =>
    `<tr><td><strong>${esc(x.title)}</strong><br/><span class="muted">${esc(x.category)} · ${esc(x.meta)}</span></td><td>${rowBtns(x.id)}</td></tr>`).join('');
  return `<div class="card"><h3>${r ? 'Edit resource' : 'Add resource'}</h3><div class="form-grid">
  <label class="fl full">Title<input id="f-rtitle" value="${esc(r?.title ?? '')}"/></label>
  <label class="fl">Category<input id="f-rcat" value="${esc(r?.category ?? '')}" placeholder="Any label — becomes a tab"/></label>
  <label class="fl">Meta<input id="f-rmeta" value="${esc(r?.meta ?? '')}"/></label>
  <label class="fl">File name<input id="f-rfile" value="${esc(r?.fileName ?? '')}"/></label>
  <label class="fl">File kind<input id="f-rkind" value="${esc(r?.fileKind ?? '')}"/></label>
  <label class="fl full">Description<textarea id="f-rdesc" rows="2">${esc(r?.description ?? '')}</textarea></label>
  </div><p><button class="btn btn-primary" id="saveRes">${r ? 'Update' : 'Add'} resource</button>
  ${r ? '<button class="btn btn-ghost" id="cancelEdit">Cancel</button>' : ''}</p></div>
  <div class="card"><h3>All resources (${cms.resources.length})</h3><table class="table"><tbody>${table}</tbody></table></div>`;
}
function admGallery(): string {
  const cms = getCms();
  const g = editId ? cms.gallery.find((x) => x.id === editId) : undefined;
  const table = cms.gallery.map((x) =>
    `<tr><td>${esc(x.emoji)} <strong>${esc(x.title)}</strong><br/><span class="muted">${esc(x.category)}</span></td><td>${rowBtns(x.id)}</td></tr>`).join('');
  return `<div class="card"><h3>${g ? 'Edit item' : 'Add item'}</h3><div class="form-grid">
  <label class="fl">Title<input id="f-gtitle" value="${esc(g?.title ?? '')}"/></label>
  <label class="fl">Category<input id="f-gcat" value="${esc(g?.category ?? '')}" placeholder="Any label — becomes a filter"/></label>
  <label class="fl">Emoji<input id="f-gemoji" value="${esc(g?.emoji ?? '🖼️')}"/></label>
  <label class="fl">Gradient CSS<input id="f-ggrad" value="${esc(g?.gradient ?? 'linear-gradient(135deg,#1b3b36,#2f6b5e)')}"/></label>
  <label class="fl full">Caption<textarea id="f-gcap" rows="2">${esc(g?.caption ?? '')}</textarea></label>
  </div><p><button class="btn btn-primary" id="saveGal">${g ? 'Update' : 'Add'} item</button>
  ${g ? '<button class="btn btn-ghost" id="cancelEdit">Cancel</button>' : ''}</p></div>
  <div class="card"><h3>All items (${cms.gallery.length})</h3><table class="table"><tbody>${table}</tbody></table></div>`;
}
function admInbox(): string {
  const cms = getCms();
  return `<div class="card"><h3>Inbox (${cms.inbox.length})</h3>
  ${cms.inbox.length ? cms.inbox.map((m) =>
    `<div class="card" style="margin-bottom:.6rem"><p><strong>${esc(m.name)}</strong> <span class="muted">${esc(m.email)} · ${esc(m.topic)} · ${esc(m.date)}</span></p>
    <p>${esc(m.message)}</p><button class="btn btn-danger btn-sm" data-delmsg="${m.id}">Delete</button></div>`).join('')
    : '<p class="muted">No messages. Contact-form submissions land here.</p>'}</div>`;
}
function admBackup(): string {
  return `<div class="card"><h3>Backup & restore</h3>
  <p class="muted">Export the whole CMS as JSON (settings + all collections + inbox). Import it on another browser to migrate.</p>
  <p><button class="btn btn-primary btn-sm" id="expJson">Export JSON</button>
  <label class="fl">Import JSON file<input id="impJson" type="file" accept="application/json"/></label></p>
  <p><button class="btn btn-danger btn-sm" id="resetSeed">Reset to seed defaults</button></p>
  <p class="muted" id="bkMsg"></p></div>`;
}
//__ADMIN6__
function delFrom<K extends 'programmes' | 'staff' | 'papers' | 'news' | 'events' | 'resources' | 'gallery'>(key: K, id: string): void {
  const cms = getCms();
  (cms[key] as Array<{ id: string }>).splice(
    (cms[key] as Array<{ id: string }>).findIndex((x) => x.id === id), 1);
  saveCms(); editId = null; refresh();
}
function bindCrud(): void {
  document.querySelectorAll('[data-edit]').forEach((b) => (b as HTMLElement).onclick = () => {
    editId = (b as HTMLElement).dataset.edit ?? null; refresh();
  });
  document.querySelectorAll('[data-del]').forEach((b) => (b as HTMLElement).onclick = () => {
    const id = (b as HTMLElement).dataset.del ?? '';
    if (!confirm('Delete this item?')) return;
    if (tab === 'Programmes') delFrom('programmes', id);
    else if (tab === 'Staff') delFrom('staff', id);
    else if (tab === 'Research') delFrom('papers', id);
    else if (tab === 'News') delFrom('news', id);
    else if (tab === 'Events') delFrom('events', id);
    else if (tab === 'Resources') delFrom('resources', id);
    else delFrom('gallery', id);
  });
  document.querySelectorAll('[data-delmsg]').forEach((b) => (b as HTMLElement).onclick = () => {
    const cms = getCms();
    cms.inbox = cms.inbox.filter((m) => m.id !== (b as HTMLElement).dataset.delmsg);
    saveCms(); refresh();
  });
  document.getElementById('cancelEdit')?.addEventListener('click', () => { editId = null; refresh(); });
  document.querySelectorAll('[data-goto]').forEach((b) => (b as HTMLElement).onclick = () => {
    tab = ((b as HTMLElement).dataset.goto ?? 'Overview') as typeof tab; editId = null; refresh();
  });
}

function sVal(key: string): string { return val(`s-${key}`); }

function bindSavers(): void {
  document.getElementById('saveSettings')?.addEventListener('click', () => {
    const cms = getCms();
    const keys: (keyof SiteSettings)[] = ['brandName','brandSub','topLeft','topRight','heroKicker','heroTitle','heroSub',
      'cta1Label','cta1Href','cta2Label','cta2Href','history','vision','mission','hodId','hodSectionTitle','hodQuote',
      'phone','email','address','hours','mapLabel','footerAccred','socialLinkedIn','socialX','socialYouTube',
      'emergencySec','emergencyClinic','copyright','adminPass','pine','accent'];
    keys.forEach((k) => { (cms.settings[k] as string) = sVal(k); });
    saveCms(); refresh();
  });
  document.getElementById('saveProg')?.addEventListener('click', () => {
    const cms = getCms();
    const rec = { title: val('f-title'), unit: val('f-unit'), level: val('f-level'), duration: val('f-duration'),
      summary: val('f-summary'), entryRequirements: listParse(val('f-entry')), modules: listParse(val('f-modules')),
      careers: listParse(val('f-careers')), badge: val('f-badge') || undefined };
    if (!rec.title) { alert('Title is required'); return; }
    if (editId) { Object.assign(cms.programmes.find((x) => x.id === editId)!, rec); }
    else cms.programmes.push({ id: uid('prog'), ...rec });
    saveCms(); editId = null; refresh();
  });
  document.getElementById('saveStaff')?.addEventListener('click', () => {
    const cms = getCms();
    const rec = { name: val('f-name'), title: val('f-title2'), letters: val('f-letters'), role: val('f-role'),
      type: val('f-type') || 'Academic', department: val('f-dept'), specialty: listParse(val('f-spec')),
      email: val('f-email'), phone: val('f-phone'), bio: val('f-bio'), publications: listParse(val('f-pubs')),
      photo: val('f-photo'), initials: val('f-initials') || val('f-name').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() };
    if (!rec.name) { alert('Name is required'); return; }
    if (editId) Object.assign(cms.staff.find((x) => x.id === editId)!, rec);
    else cms.staff.push({ id: uid('staff'), ...rec });
    saveCms(); editId = null; refresh();
  });
  document.getElementById('savePaper')?.addEventListener('click', () => {
    const cms = getCms();
    const rec = { title: val('f-ptitle'), cluster: val('f-cluster') || 'General',
      year: Number(val('f-year')) || new Date().getFullYear(), journal: val('f-journal'), doi: val('f-doi'),
      downloads: Number(val('f-dls')) || 0, authors: listParse(val('f-authors')), abstract: val('f-abstract') };
    if (!rec.title) { alert('Title is required'); return; }
    if (editId) Object.assign(cms.papers.find((x) => x.id === editId)!, rec);
    else cms.papers.push({ id: uid('paper'), ...rec });
    saveCms(); editId = null; refresh();
  });
}
//__ADMIN7__
function bindSavers2(): void {
  document.getElementById('saveNews')?.addEventListener('click', () => {
    const cms = getCms();
    const rec = { title: val('f-ntitle'), date: val('f-ndate'), category: val('f-ncat'),
      summary: val('f-nsum'), body: val('f-nbody').split('\n').map((s) => s.trim()).filter(Boolean) };
    if (!rec.title) { alert('Title is required'); return; }
    if (editId) Object.assign(cms.news.find((x) => x.id === editId)!, rec);
    else cms.news.push({ id: uid('news'), ...rec });
    saveCms(); editId = null; refresh();
  });
  document.getElementById('saveEvent')?.addEventListener('click', () => {
    const cms = getCms();
    const rec = { title: val('f-etitle'), date: val('f-edate'), time: val('f-etime'),
      location: val('f-eloc'), tag: val('f-etag'), description: val('f-edesc') };
    if (!rec.title) { alert('Title is required'); return; }
    if (editId) Object.assign(cms.events.find((x) => x.id === editId)!, rec);
    else cms.events.push({ id: uid('ev'), ...rec });
    saveCms(); editId = null; refresh();
  });
  document.getElementById('saveRes')?.addEventListener('click', () => {
    const cms = getCms();
    const rec = { title: val('f-rtitle'), category: val('f-rcat') || 'General', meta: val('f-rmeta'),
      description: val('f-rdesc'), fileName: val('f-rfile'), fileKind: val('f-rkind') };
    if (!rec.title) { alert('Title is required'); return; }
    if (editId) Object.assign(cms.resources.find((x) => x.id === editId)!, rec);
    else cms.resources.push({ id: uid('res'), ...rec });
    saveCms(); editId = null; refresh();
  });
  document.getElementById('saveGal')?.addEventListener('click', () => {
    const cms = getCms();
    const rec = { title: val('f-gtitle'), category: val('f-gcat') || 'General', caption: val('f-gcap'),
      gradient: val('f-ggrad') || 'linear-gradient(135deg,#1b3b36,#2f6b5e)', emoji: val('f-gemoji') || '🖼️' };
    if (!rec.title) { alert('Title is required'); return; }
    if (editId) Object.assign(cms.gallery.find((x) => x.id === editId)!, rec);
    else cms.gallery.push({ id: uid('gal'), ...rec });
    saveCms(); editId = null; refresh();
  });
  document.getElementById('expJson')?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(getCms(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'be-cms-backup.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });
  const imp = document.getElementById('impJson') as HTMLInputElement | null;
  imp?.addEventListener('change', () => {
    const f = imp.files?.[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = (): void => {
      try {
        const parsed = JSON.parse(String(rd.result));
        if (!parsed.settings || !parsed.programmes) throw new Error('bad file');
        replaceState(parsed);
        editId = null; refresh();
      } catch { alert('Invalid backup file'); }
    };
    rd.readAsText(f);
  });
  document.getElementById('resetSeed')?.addEventListener('click', () => {
    if (!confirm('Reset ALL content to seed defaults?')) return;
    resetCms(); editId = null; refresh();
  });
}

export function afterAdminRender(): void {
  const login = document.getElementById('adminLogin');
  if (login) {
    login.addEventListener('submit', (e) => {
      e.preventDefault();
      const pw = (document.getElementById('adminPass') as HTMLInputElement).value;
      if (pw === getCms().settings.adminPass) {
        sessionStorage.setItem('be-admin', '1');
        tab = 'Overview'; editId = null; refresh();
      } else {
        (document.getElementById('adminErr') as HTMLElement).textContent = 'Wrong password';
      }
    });
    return;
  }
  document.getElementById('adminLock')?.addEventListener('click', () => {
    sessionStorage.removeItem('be-admin'); refresh();
  });
  document.getElementById('adminTabs')?.querySelectorAll('[data-atab]').forEach((b) =>
    (b as HTMLElement).addEventListener('click', () => {
      tab = ((b as HTMLElement).dataset.atab ?? 'Overview') as typeof tab;
      editId = null; refresh();
    }));
  bindCrud(); bindSavers(); bindSavers2();
}
