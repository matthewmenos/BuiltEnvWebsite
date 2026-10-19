import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Canonical origin — must match the SITE_URL used by api/sitemap.xml.ts and
 * the canonical/og:url tags in index.html.
 */
const SITE = 'https://pubuiltenvironment.org';
const SUFFIX = 'Department of Built Environment, Pentecost University';

interface RouteMeta {
  pattern: RegExp;
  title: string;
  description: string;
}

/**
 * Public route → <title>/meta description map. The site is a SPA, so without
 * this every page would advertise the homepage title to crawlers; the hook
 * below rewrites document.title, the canonical link and the OG tags on each
 * navigation. Admin routes are excluded (they render outside Layout and are
 * disallowed in robots.txt).
 */
const ROUTES: RouteMeta[] = [
  {
    pattern: /^\/$/,
    title: 'Home',
    description:
      'Department of Built Environment at Pentecost University, Sowutuom, Accra — quantity surveying, construction management, architecture and planning programmes in Ghana.',
  },
  {
    pattern: /^\/programmes$/,
    title: 'Programmes',
    description:
      'Undergraduate and professional programmes in Quantity Surveying, Construction, Architecture and Planning at Pentecost University, Accra, Ghana.',
  },
  {
    pattern: /^\/programmes\/[^/]+$/,
    title: 'Programme Details',
    description:
      'Programme overview, admission requirements, duration and fees — Department of Built Environment, Pentecost University.',
  },
  {
    pattern: /^\/news$/,
    title: 'News',
    description:
      'Latest news, awards and announcements from the Department of Built Environment, Pentecost University, Accra.',
  },
  {
    pattern: /^\/news\/[^/]+$/,
    title: 'News Article',
    description:
      'News article from the Department of Built Environment, Pentecost University, Accra, Ghana.',
  },
  {
    pattern: /^\/events$/,
    title: 'Events',
    description:
      'Seminars, workshops, open days and public lectures hosted by the Department of Built Environment, Pentecost University.',
  },
  {
    pattern: /^\/events\/[^/]+$/,
    title: 'Event Details',
    description:
      'Event details — Department of Built Environment, Pentecost University, Accra, Ghana.',
  },
  {
    pattern: /^\/staff$/,
    title: 'Staff',
    description:
      'Meet the academics and professionals teaching in the Department of Built Environment, Pentecost University, Accra.',
  },
  {
    pattern: /^\/staff\/[^/]+$/,
    title: 'Staff Profile',
    description:
      'Staff profile — Department of Built Environment, Pentecost University, Accra, Ghana.',
  },
  {
    pattern: /^\/research$/,
    title: 'Research',
    description:
      'Research areas and labs in the Department of Built Environment, Pentecost University — climate-resilient housing, sustainable construction and urban planning for Ghanaian cities.',
  },
  {
    pattern: /^\/resources$/,
    title: 'Resources & Downloads',
    description:
      'Notices, timetables, handbooks and downloadable resources — Department of Built Environment, Pentecost University, Accra.',
  },
  {
    pattern: /^\/resources\/notices\/[^/]+$/,
    title: 'Notice',
    description:
      'Official notice — Department of Built Environment, Pentecost University, Accra, Ghana.',
  },
  {
    pattern: /^\/gallery$/,
    title: 'Gallery',
    description:
      'Photos from studios, site visits and department life — Department of Built Environment, Pentecost University, Accra.',
  },
  {
    pattern: /^\/gallery\/[^/]+$/,
    title: 'Gallery Item',
    description:
      'Gallery photo — Department of Built Environment, Pentecost University, Accra, Ghana.',
  },
  {
    pattern: /^\/contact$/,
    title: 'Contact Us',
    description:
      'Contact the Department of Built Environment, Pentecost University, Sowutuom, Accra, Ghana — address, phone, office hours and directions.',
  },
];

/** Create-or-update a <meta> tag keyed by attribute value. */
const upsertMeta = (
  tag: 'meta',
  attr: 'name' | 'property',
  key: string,
  content: string
): void => {
  let el = document.head.querySelector<HTMLMetaElement>(`${tag}[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement(tag);
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const PageTitle: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const route = ROUTES.find((r) => r.pattern.test(pathname));
    const title = route ? `${route.title} | ${SUFFIX}` : SUFFIX;
    const description = route?.description;
    // Normalize trailing slash so canonical URLs are consistent.
    const url = `${SITE}${pathname === '/' ? '/' : pathname.replace(/\/+$/, '')}`;

    document.title = title;
    if (description) upsertMeta('meta', 'name', 'description', description);
    upsertMeta('meta', 'property', 'og:title', title);
    upsertMeta('meta', 'property', 'og:url', url);
    if (description) upsertMeta('meta', 'property', 'og:description', description);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  }, [pathname]);

  return null;
};

export default PageTitle;
