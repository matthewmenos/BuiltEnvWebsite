// ── Department of Built Environment · Core domain types ──
export type ProgrammeLevel = 'Undergraduate' | 'Postgraduate' | 'Diploma';
export type ResourceCategory = 'Timetable' | 'Notices' | 'Internship' | 'Handbook';
export type GalleryCategory = 'Campus' | 'Labs' | 'Field Trips' | 'Student Projects';
export type StaffType = 'Academic' | 'Administrative';

export interface Programme {
  id: string;
  title: string;
  unit: string;
  level: string;
  duration: string;
  summary: string;
  entryRequirements: string[];
  modules: string[];
  careers: string[];
  badge?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  title: string;
  letters: string;
  role: string;
  type: string;
  department: string;
  specialty: string[];
  email: string;
  phone: string;
  bio: string;
  publications: string[];
  photo: string;
  initials: string;
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  cluster: string;
  abstract: string;
  journal: string;
  doi: string;
  downloads: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  body: string[];
}

export interface DeptEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  tag: string;
  description: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  category: string;
  meta: string;
  description: string;
  fileName: string;
  fileKind: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  caption: string;
  gradient: string;
  emoji: string;
}

export type RoutePath =
  | '#/home' | '#/about' | '#/programmes' | '#/staff'
  | '#/research' | '#/resources' | '#/gallery' | '#/contact' | '#/admin';

// ── CMS: every string/collection on the public site is configurable ──
export interface SiteSettings {
  brandName: string;
  brandSub: string;
  topLeft: string;
  topRight: string;
  heroKicker: string;
  heroTitle: string;
  heroSub: string;
  cta1Label: string;
  cta1Href: string;
  cta2Label: string;
  cta2Href: string;
  history: string;
  vision: string;
  mission: string;
  hodId: string;
  hodSectionTitle: string;
  hodQuote: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  mapLabel: string;
  footerAccred: string;
  socialLinkedIn: string;
  socialX: string;
  socialYouTube: string;
  emergencySec: string;
  emergencyClinic: string;
  copyright: string;
  adminPass: string;
  pine: string;
  accent: string;
}

export interface InboxMessage {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  date: string;
}
