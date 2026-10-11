import React, { useCallback, useEffect, useState } from 'react';
import { ChevronRight, Megaphone, X } from 'lucide-react';
import { publicApi } from '../lib/publicApi';

interface Notice {
  id: string;
  title: string;
  body: string;
}

const ROTATE_MS = 7000;
const DISMISS_KEY = 'notice-bar-dismissed';

/**
 * Announcement bar at the top of the homepage. Rotates through the active
 * notices managed in Admin → Notices (already expiry-aware). Dismissible —
 * the dismissal is remembered for the session so it does not nag on every
 * route change. Auto-rotation is skipped for reduced-motion users.
 */
const NoticeBar: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(DISMISS_KEY) === '1'
  );

  useEffect(() => {
    let cancelled = false;
    publicApi
      .listActiveNotices()
      .then((items) => {
        if (!cancelled && items.length > 0) {
          setNotices(items as Notice[]);
        }
      })
      .catch(() => {
        // Never block the page for a missing announcement bar.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (notices.length <= 1 || dismissed) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % notices.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [notices.length, dismissed]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    sessionStorage.setItem(DISMISS_KEY, '1');
  }, []);

  if (dismissed || notices.length === 0) return null;

  const notice = notices[index % notices.length];
  if (!notice) return null;

  const snippet =
    notice.body && notice.body.length > 120
      ? `${notice.body.slice(0, 117).trimEnd()}…`
      : notice.body;

  return (
    <div className="notice-bar" role="region" aria-label="Announcements">
      <div className="notice-bar-inner">
        <span className="notice-bar-icon" aria-hidden="true">
          <Megaphone size={16} />
        </span>
        <span className="notice-bar-label">Notice</span>
        <div className="notice-bar-content">
          <strong className="notice-bar-title">{notice.title}</strong>
          {snippet && <span className="notice-bar-text">{snippet}</span>}
        </div>
        {notices.length > 1 && (
          <button
            type="button"
            className="notice-bar-next"
            onClick={() => setIndex((i) => (i + 1) % notices.length)}
            aria-label="Show next notice"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          className="notice-bar-close"
          onClick={handleDismiss}
          aria-label="Dismiss announcements"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default NoticeBar;
