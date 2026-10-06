// UI renderers — 100% CMS-driven (store.ts). No hardcoded content.
import type { RoutePath } from './types.js';
import { getCms, saveCms, uid } from './store.js';
function esc(s: unknown): string { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
function S() { return getCms().settings; }
function syncWin(): void { (window as unknown as { __cms?: unknown }).__cms = getCms(); }
export function openModal(html: string): void {
  const b = document.getElementById('modalBody'); const back = document.getElementById('modalBack');
  if (b && back) { b.innerHTML = html; back.classList.add('open'); }
}
function closeModal(): void { document.getElementById('modalBack')?.classList.remove('open'); }
function hero(): string {
  const s = S();
  return `<section class="hero"><span class="eyebrow" style="color:#fbbf24">${esc(s.heroKicker)}</span><h1>${esc(s.heroTitle)}</h1><p>${esc(s.heroSub)}</p><div class="cta"><a class="btn btn-primary" href="${esc(s.cta1Href)}">${esc(s.cta1Label)}</a><a class="btn btn-ghost" href="${esc(s.cta2Href)}">${esc(s.cta2Label)}</a></div></section>`;
}
function hod(): string {
  const cms = getCms(); const s = cms.settings;
  const h = cms.staff.find((x) => x.id === s.hodId) ?? cms.staff[0];
  if (!h) return '';
  return `<section class="section"><span class="eyebrow">Leadership</span><h2>${esc(s.hodSectionTitle)}</h2><div class="card hod"><div class="avatar">${esc(h.initials)}</div><div><h3>${esc(h.name)} <span class="muted">${esc(h.letters)}</span></h3><p>${esc(h.bio)}</p><p><em>"${esc(s.hodQuote)}" — ${esc(h.name)}</em></p></div></div></section>`;
}
function progCards(filter = 'All'): string {
  const list = getCms().programmes.filter((p) => filter === 'All' || p.level === filter).slice(0, 4);
  return `<div class="grid g4">` + list.map((p) => `<article class="card"><span class="badge">${esc(p.level)}</span><h3>${esc(p.title)}</h3><p class="muted">${esc(p.unit)} · ${esc(p.duration)}</p><p>${esc(p.summary)}</p><button class="btn btn-primary" data-prog="${p.id}">Details</button></article>`).join('') + `</div>`;
}
function viewHome(): string {
  const cms = getCms();
  const clusters = Array.from(new Set(cms.papers.map((p) => p.cluster)));
  return hero() + hod()
  + `<section class="section"><span class="eyebrow">Academics</span><h2>Our Programmes</h2><div class="filters" id="homeProgFilter">${levels().map((f,i)=>`<button class="filter-btn${i===0?' on':''}" data-f="${f}">${f}</button>`).join('')}</div><div id="homeProgGrid">${progCards()}</div><p><a href="#/programmes">View all programmes →</a></p></section>`
  + `<section class="section"><span class="eyebrow">Newsroom</span><h2>Latest News</h2><div class="grid g3">`
  + cms.news.map((n) => `<article class="card"><span class="badge">${esc(n.category)}</span><h3>${esc(n.title)}</h3><p class="muted">${esc(n.date)}</p><p>${esc(n.summary)}</p><button class="btn btn-ghost" data-news="${n.id}">Read More</button></article>`).join('')
  + `</div></section>`
  + `<section class="section"><span class="eyebrow">Discovery</span><h2>Research & Innovation</h2><div class="grid g3">`
  + clusters.map((c) => `<div class="card"><h3>${esc(c)}</h3><p class="muted">${cms.papers.filter((p)=>p.cluster===c).length} flagship papers</p></div>`).join('')
  + `</div><p><a href="#/research">Browse papers →</a></p></section>`
  + `<section class="section"><span class="eyebrow">Calendar</span><h2>Upcoming Events</h2><div class="grid g2">`
  + cms.events.slice(0,2).map((e) => `<div class="card"><span class="badge">${esc(e.tag)}</span><h3>${esc(e.title)}</h3><p class="muted">${esc(e.date)} · ${esc(e.time)} · ${esc(e.location)}</p><button class="btn btn-primary" data-rsvp="${e.id}">RSVP</button></div>`).join('')
  + `</div></section>`
  + `<section class="section"><span class="eyebrow">People</span><h2>Meet Our Staff</h2><div class="grid g4">`
  + cms.staff.slice(0,4).map((s) => `<div class="card"><div class="avatar" style="font-size:1.6rem">${esc(s.initials)}</div><h3>${esc(s.name)}</h3><p class="muted">${esc(s.title)}</p><button class="btn btn-ghost" data-bio="${s.id}">View Bio</button></div>`).join('')
  + `</div></section>`
  + `<section class="section"><span class="eyebrow">Moments</span><h2>Gallery</h2><div class="grid g4">`
  + cms.gallery.slice(0,4).map((g) => `<button class="gallery-tile" style="background:${esc(g.gradient)}" data-lb="${g.id}"><strong>${esc(g.emoji)} ${esc(g.title)}</strong><small>${esc(g.caption)}</small></button>`).join('')
  + `</div></section>`;
}
function viewAbout(): string {
  const s = S();
  return `<section class="section"><span class="eyebrow">About</span><h1>${esc(s.brandName)}</h1>`
  + `<div class="grid g2"><div class="card"><h3>History</h3><p>${esc(s.history)}</p></div>`
  + `<div class="card"><h3>Vision & Mission</h3><p><strong>Vision:</strong> ${esc(s.vision)}<br/><strong>Mission:</strong> ${esc(s.mission)}</p></div></div></section>` + hod();
}
/* CMS views consolidated below (single Views export at end of file) */
//__VIEWS_A__
function firstResCat(): string { return getCms().resources[0]?.category ?? 'Timetable'; }

function levels(): string[] {
  const v = getCms().programmes.map((p) => p.level);
  return ['All', ...Array.from(new Set(v))];
}
function viewProgrammes(): string {
  return `<section class="section"><span class="eyebrow">Study with us</span><h1>Programmes</h1>
  <div class="filters" id="progFilter">${levels().map((f,i)=>`<button class="filter-btn${i===0?' on':''}" data-f="${f}">${f}</button>`).join('')}</div>
  <div class="grid g2" id="progGrid"></div></section>`;
}
function renderProgGrid(filter: string): void {
  const el = document.getElementById('progGrid'); if (!el) return;
  const list = getCms().programmes.filter((p) => filter==='All'||p.level===filter);
  el.innerHTML = list.map((p) => `<article class="card">${p.badge?`<span class="badge">${p.badge}</span>`:''}
  <h3>${p.title}</h3><p class="muted">${p.unit} · ${p.level} · ${p.duration}</p><p>${p.summary}</p>
  <button class="btn btn-primary" data-prog="${p.id}">Entry + Modules</button></article>`).join('');
}
function staffTypes(): string[] {
  const v = getCms().staff.map((s) => s.type).filter(Boolean);
  return ['All', ...Array.from(new Set(v))];
}
function viewStaff(): string {
  return `<section class="section"><span class="eyebrow">People</span><h1>Staff Directory</h1>
  <input id="staffSearch" class="searchbar" placeholder="Search name, department, expertise..." aria-label="Search staff"/>
  <div class="chips" id="staffType">${staffTypes().map((t,i)=>`<button class="chip${i===0?' on':''}" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div>
  <div class="grid g4" id="staffGrid"></div></section>`;
}
function renderStaff(q: string, t: string): void {
  const el = document.getElementById('staffGrid'); if (!el) return;
  const needle = q.toLowerCase();
  const list = getCms().staff.filter((s) => (t==='All'||s.type===t) && (!needle || (s.name+s.department+s.specialty.join(' ')+s.role).toLowerCase().includes(needle)));
  el.innerHTML = list.length ? list.map((s) => `<div class="card"><div class="avatar" style="font-size:1.6rem">${s.initials}</div>
  <h3>${s.name}</h3><p class="muted">${s.title}<br/>${s.department}</p><p>${s.specialty.join(' · ')}</p>
  <button class="btn btn-ghost" data-bio="${s.id}">View Bio</button></div>`).join('') : `<p>No staff match.</p>`;
}
function viewResearch(): string {
  const clusters = Array.from(new Set(getCms().papers.map((p) => p.cluster)));
  const filters = ['All', ...clusters];
  return `<section class="section"><span class="eyebrow">Discovery</span><h1>Research & Innovation</h1>
  <div class="grid g3">${clusters.map((c)=>`<div class="card"><h3>${esc(c)}</h3><p class="muted">${getCms().papers.filter((p) => p.cluster === c).length} papers in this cluster</p></div>`).join('')}</div>
  <div class="filters" id="paperFilter">${filters.map((f,i)=>`<button class="filter-btn${i===0?' on':''}" data-f="${esc(f)}">${esc(f)}</button>`).join('')}</div>
  <div class="grid g2" id="paperGrid"></div></section>`;
}
function renderPapers(filter: string): void {
  const el = document.getElementById('paperGrid'); if (!el) return;
  const list = getCms().papers.filter((p) => filter==='All'||p.cluster===filter);
  el.innerHTML = list.map((p) => `<article class="card"><span class="badge">${p.cluster} · ${p.year}</span>
  <h3>${p.title}</h3><p class="muted">${p.authors.join(', ')} · ${p.journal}</p>
  <p>${p.abstract}</p><p><button class="btn btn-ghost" data-abs="${p.id}">Abstract</button>
  <button class="btn btn-primary" data-dl="${p.id}">Download PDF (${p.downloads})</button></p></article>`).join('');
}
function viewResources(): string {
  const cats = Array.from(new Set(getCms().resources.map((r) => r.category)));
  return `<section class="section"><span class="eyebrow">Student hub</span><h1>Resources</h1>
  <div class="tabs" id="resTabs">${cats.map((t,i)=>`<button class="tab${i===0?' on':''}" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div>
  <div class="grid g2" id="resGrid"></div></section>`;
}
function renderRes(tab: string): void {
  const el = document.getElementById('resGrid'); if (!el) return;
  const list = getCms().resources.filter((r) => r.category===tab);
  el.innerHTML = list.map((r) => `<div class="card"><span class="badge">${r.fileKind}</span><h3>${r.title}</h3>
  <p class="muted">${r.meta}</p><p>${r.description}</p>
  <button class="btn btn-primary" data-file="${r.fileName}" data-title="${r.title}">Download</button></div>`).join('');
}
function viewGallery(): string {
  const cats = ['All', ...Array.from(new Set(getCms().gallery.map((g) => g.category)))];
  return `<section class="section"><span class="eyebrow">Moments</span><h1>Gallery</h1>
  <div class="filters" id="galFilter">${cats.map((f,i)=>`<button class="filter-btn${i===0?' on':''}" data-f="${esc(f)}">${esc(f)}</button>`).join('')}</div>
  <div class="grid g4" id="galGrid"></div></section>`;
}
function renderGallery(filter: string): void {
  const el = document.getElementById('galGrid'); if (!el) return;
  const list = getCms().gallery.filter((g) => filter==='All'||g.category===filter);
  el.innerHTML = list.map((g) => `<button class="gallery-tile" style="background:${g.gradient}" data-lb="${g.id}"><strong>${g.emoji} ${g.title}</strong><small>${g.caption} · ${g.category}</small></button>`).join('');
}
function viewEventsOnly(): string {
  return `<section class="section"><span class="eyebrow">Calendar</span><h1>Upcoming Events</h1><div class="grid g2">`
  + getCms().events.map((e) => `<div class="card"><span class="badge">${e.tag}</span><h3>${e.title}</h3><p class="muted">${e.date} · ${e.time}</p><p>${e.location}</p><p>${e.description}</p><button class="btn btn-primary" data-rsvp="${e.id}">RSVP / Add to Calendar</button></div>`).join('') + `</div></section>`;
}
function viewContact(): string {
  const s = S();
  return `<section class="section"><span class="eyebrow">Talk to us</span><h1>Contact Us</h1>
  <div class="grid g2"><div class="card"><h3>Department Office</h3>
  <p>📞 ${esc(s.phone)}<br/>✉️ ${esc(s.email)}<br/>📍 ${esc(s.address)}<br/>🕘 ${esc(s.hours)}</p>
  <div class="mapbox">${s.mapLabel}</div></div>
  <div class="card"><h3>Feedback / Inquiry Form</h3>
  <form id="contactForm" novalidate><p><label>Name<input id="cfName" required/></label><span class="form-err" id="eName"></span></p>
  <p><label>Email<input id="cfEmail" type="email" required/></label><span class="form-err" id="eEmail"></span></p>
  <p><label>Topic<select id="cfTopic">${inquiryTopics().map((t) => `<option>${esc(t)}</option>`).join('')}</select></label></p>
  <p><label>Message<textarea id="cfMsg" rows="4" required></textarea></label><span class="form-err" id="eMsg"></span></p>
  <button class="btn btn-primary" type="submit">Send Inquiry</button> <span class="form-ok" id="cfOk"></span></form></div></div></section>`;
}
function inquiryTopics(): string[] {
  const fromResources = getCms().resources.map((r) => r.category);
  const base = ['General', ...Array.from(new Set(fromResources))];
  return base;
}
function download(title: string, fileName: string): void {
  const blob = new Blob([[title, fileName].join('\n')], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = fileName; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function infoModal(title: string, body: string): void { openModal(`<h2>${title}</h2><p>${body}</p>`); }
function bindCards(): void {
  document.querySelectorAll('[data-prog]').forEach((b) => b.addEventListener('click', () => {
    const p = getCms().programmes.find((x) => x.id === (b as HTMLElement).dataset.prog); if (!p) return;
    openModal(`<h2>${p.title}</h2><p class="muted">${p.unit}</p><p>${p.summary}</p><p><strong>Entry:</strong> ${p.entryRequirements.join('; ')}</p><ul>${p.modules.map((m) => `<li>${m}</li>`).join('')}</ul>`);
  }));
  document.querySelectorAll('[data-bio]').forEach((b) => b.addEventListener('click', () => {
    const s = getCms().staff.find((x) => x.id === (b as HTMLElement).dataset.bio); if (!s) return;
    infoModal(s.name, `${s.title} - ${s.bio} Email ${s.email}`);
  }));
  document.querySelectorAll('[data-news]').forEach((b) => b.addEventListener('click', () => {
    const n = getCms().news.find((x) => x.id === (b as HTMLElement).dataset.news); if (n) infoModal(n.title, n.body.join(' '));
  }));
  document.querySelectorAll('[data-rsvp]').forEach((b) => b.addEventListener('click', () => {
    const e = getCms().events.find((x) => x.id === (b as HTMLElement).dataset.rsvp); if (e) infoModal('RSVP: ' + e.title, 'Reserved! Invite sent (demo).');
  }));
  document.querySelectorAll('[data-dl]').forEach((b) => b.addEventListener('click', () => {
    const p = getCms().papers.find((x) => x.id === (b as HTMLElement).dataset.dl); if (p) download(p.title, p.id + '.pdf');
  }));
  document.querySelectorAll('[data-file]').forEach((b) => b.addEventListener('click', () => {
    const el = b as HTMLElement; download(el.dataset.title || 'file', el.dataset.file || 'file.pdf');
  }));
  document.querySelectorAll('[data-lb]').forEach((b) => b.addEventListener('click', () => {
    const g = getCms().gallery.find((x) => x.id === (b as HTMLElement).dataset.lb); if (!g) return;
    const t = document.getElementById('lbTitle'); const c = document.getElementById('lbCap');
    if (t) t.textContent = g.title; if (c) c.textContent = g.caption;
    document.getElementById('lightbox')?.classList.add('open');
  }));
}
export function bindGlobal(): void { bindCards(); bindPage(); }
function bindPage(): void {
  document.getElementById('modalClose')?.addEventListener('click', closeModal);
  document.getElementById('lbClose')?.addEventListener('click', () => document.getElementById('lightbox')?.classList.remove('open'));
  const hf = document.getElementById('homeProgFilter');
  if (hf) hf.querySelectorAll('button').forEach((btn) => btn.addEventListener('click', () => {
    hf.querySelectorAll('button').forEach((x) => x.classList.remove('on')); btn.classList.add('on');
    const g = document.getElementById('homeProgGrid'); if (g) { g.innerHTML = progCards((btn as HTMLElement).dataset.f || 'All'); bindCards(); }
  }));
  const pf = document.getElementById('progFilter');
  if (pf) { renderProgGrid('All'); bindCards(); pf.querySelectorAll('button').forEach((btn) => btn.addEventListener('click', () => {
    pf.querySelectorAll('button').forEach((x) => x.classList.remove('on')); btn.classList.add('on');
    renderProgGrid((btn as HTMLElement).dataset.f || 'All'); bindCards();
  })); }
  const si = document.getElementById('staffSearch') as HTMLInputElement | null;
  const st = document.getElementById('staffType');
  if (si || st) {
    let t = 'All'; const draw = (): void => { renderStaff(si?.value || '', t); bindCards(); }; draw();
    st?.querySelectorAll('button').forEach((btn) => btn.addEventListener('click', () => {
      st.querySelectorAll('button').forEach((x) => x.classList.remove('on')); btn.classList.add('on');
      t = (btn as HTMLElement).dataset.t || 'All'; draw();
    }));
    si?.addEventListener('input', draw);
  }
  const ppf = document.getElementById('paperFilter');
  if (ppf) { renderPapers('All'); bindCards(); ppf.querySelectorAll('button').forEach((btn) => btn.addEventListener('click', () => {
    ppf.querySelectorAll('button').forEach((x) => x.classList.remove('on')); btn.classList.add('on');
    renderPapers((btn as HTMLElement).dataset.f || 'All'); bindCards();
  })); }
  const rt = document.getElementById('resTabs');
  if (rt) { renderRes(firstResCat()); bindCards(); rt.querySelectorAll('button').forEach((btn) => btn.addEventListener('click', () => {
    rt.querySelectorAll('button').forEach((x) => x.classList.remove('on')); btn.classList.add('on');
    renderRes((btn as HTMLElement).dataset.t || firstResCat()); bindCards();
  })); }
  const gf = document.getElementById('galFilter');
  if (gf) { renderGallery('All'); bindCards(); gf.querySelectorAll('button').forEach((btn) => btn.addEventListener('click', () => {
    gf.querySelectorAll('button').forEach((x) => x.classList.remove('on')); btn.classList.add('on');
    renderGallery((btn as HTMLElement).dataset.f || 'All'); bindCards();
  })); }
  document.getElementById('contactForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = (document.getElementById('cfName') as HTMLInputElement).value.trim();
    const email = (document.getElementById('cfEmail') as HTMLInputElement).value.trim();
    const topicEl = document.getElementById('cfTopic') as HTMLSelectElement | null;
    const topic = topicEl ? topicEl.value : 'General';
    const msg = (document.getElementById('cfMsg') as HTMLTextAreaElement).value.trim();
    let ok = true;
    const set = (id: string, v: string): void => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('eName', name ? '' : 'Name required'); if (!name) ok = false;
    const em = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email); set('eEmail', em ? '' : 'Valid email required'); if (!em) ok = false;
    set('eMsg', msg.length >= 10 ? '' : 'Min 10 chars'); if (msg.length < 10) ok = false;
    if (ok) {
      const cms = getCms();
      cms.inbox.unshift({ id: uid('msg'), name, email, topic, message: msg, date: new Date().toLocaleString() });
      saveCms(); syncWin();
      set('cfOk', 'Sent! Viewable in Admin → Inbox.');
      (document.getElementById('contactForm') as HTMLFormElement).reset();
    }
  });
  document.querySelectorAll('[data-abs]').forEach((b) => b.addEventListener('click', () => {
    const p = getCms().papers.find((x) => x.id === (b as HTMLElement).dataset.abs); if (p) infoModal(p.title, p.abstract);
  }));
}
export const Views: Record<RoutePath, () => string> & { afterRender(r: RoutePath): void } = {
  '#/home': () => viewHome() + viewEventsOnly(), '#/about': viewAbout,
  '#/programmes': viewProgrammes, '#/staff': viewStaff, '#/research': viewResearch, '#/resources': viewResources, '#/gallery': viewGallery, '#/contact': viewContact, '#/admin': () => '',
  afterRender(_r: RoutePath): void { syncWin(); bindGlobal(); },
};
