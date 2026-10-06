// CMS store: single source of truth, persisted to localStorage.
// data.ts now only holds SEED defaults used on first run / reset.
import type {
  DeptEvent, GalleryItem, InboxMessage, NewsArticle,
  Programme, ResearchPaper, ResourceItem, SiteSettings, StaffMember,
} from './types.js';
import {
  EVENTS as SEED_EVENTS, GALLERY as SEED_GALLERY, NEWS as SEED_NEWS,
  PAPERS as SEED_PAPERS, PROGRAMMES as SEED_PROGRAMMES,
  RESOURCES as SEED_RESOURCES, STAFF as SEED_STAFF,
} from './data.js';

export const LS_KEY = 'be-cms-v1';

export interface CmsState {
  settings: SiteSettings;
  programmes: Programme[];
  staff: StaffMember[];
  papers: ResearchPaper[];
  news: NewsArticle[];
  events: DeptEvent[];
  resources: ResourceItem[];
  gallery: GalleryItem[];
  inbox: InboxMessage[];
}

export const DEFAULT_SETTINGS: SiteSettings = {
  brandName: 'DEPARTMENT OF BUILT ENVIRONMENT',
  brandSub: 'UNIVERSITY · EST. 1987',
  topLeft: 'Accredited Programmes · RICS · BORAQS',
  topRight: 'Emergency: +254 700 999 000',
  heroKicker: 'Admissions 2026/27 open',
  heroTitle: 'BUILDING THE FUTURE OF THE BUILT ENVIRONMENT',
  heroSub: 'Sustainable architecture, smart construction and resilient cities — studio-led degrees with live sites, fabrication labs and county partnerships.',
  cta1Label: 'Explore Programmes', cta1Href: '#/programmes',
  cta2Label: 'Apply Now', cta2Href: '#/contact',
  history: 'Founded with Quantity Surveying and Building, expanded into Architecture (1996), Planning (2004) and postgraduate resilience programmes (2019).',
  vision: "Africa's reference department for sustainable built environments.",
  mission: 'Studio-led teaching, applied research and county-engaged service.',
  hodId: 'hod',
  hodSectionTitle: 'Welcome from Head of Department',
  hodQuote: 'Academic excellence with trowel, model and model-check.',
  phone: '+254 700 100 200',
  email: 'built@university.ac.ke',
  address: 'Built Environment Complex, University Way',
  hours: 'Mon–Fri 8:00–17:00',
  mapLabel: '📌 INTERACTIVE MAP — 1.2921°S, 36.8219°E<br/>Built Environment Complex',
  footerAccred: 'BORAQS · RICS-aligned · Commission for University Education',
  socialLinkedIn: '#', socialX: '#', socialYouTube: '#',
  emergencySec: '+254 700 999 000', emergencyClinic: '+254 700 999 111',
  copyright: '© 2026 Dept. of Built Environment · Built for learning',
  adminPass: 'admin123',
  pine: '#1b3b36', accent: '#d97706',
};

function deepClone<T>(v: T): T { return JSON.parse(JSON.stringify(v)) as T; }

export function seedState(): CmsState {
  return {
    settings: deepClone(DEFAULT_SETTINGS),
    programmes: deepClone(SEED_PROGRAMMES),
    staff: deepClone(SEED_STAFF),
    papers: deepClone(SEED_PAPERS),
    news: deepClone(SEED_NEWS),
    events: deepClone(SEED_EVENTS),
    resources: deepClone(SEED_RESOURCES),
    gallery: deepClone(SEED_GALLERY),
    inbox: [],
  };
}

let state: CmsState = seedState();

export function loadCms(): CmsState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CmsState>;
      const seed = seedState();
      state = { ...seed, ...parsed, settings: { ...seed.settings, ...(parsed.settings ?? {}) } };
    }
  } catch { state = seedState(); }
  return state;
}

export function getCms(): CmsState { return state; }
export function saveCms(): void {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* private mode */ }
}
export function resetCms(): CmsState { state = seedState(); saveCms(); return state; }
export function replaceState(next: CmsState): void { state = next; saveCms(); }
export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`;
}
