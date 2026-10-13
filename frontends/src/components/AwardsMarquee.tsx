import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award } from 'lucide-react';
import type { IAward } from 'shared/schema';
import { publicApi } from '../lib/publicApi';
import { mediaUrl } from '../lib/upload';

/**
 * Scrolling awards marquee shown below the HOD welcome on the homepage.
 * Content comes from Admin → Awards; the whole strip stays hidden while
 * no awards exist. The track is rendered twice so the CSS loop is
 * seamless and auto-scrolls continuously (pausing on hover). Reduced
 * motion users get a static, manually scrollable row — matching the
 * NoticeBar / hero conventions.
 */
/** Constant scroll speed in px/second — brisk but still readable. */
const MARQUEE_SPEED_PX_PER_SEC = 130;

const AwardsMarquee: React.FC = () => {
  const [awards, setAwards] = useState<IAward[]>([]);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [groupWidth, setGroupWidth] = useState(0);

  useEffect(() => {
    let cancelled = false;
    publicApi
      .listActiveAwards()
      .then((items) => {
        if (!cancelled) setAwards(items);
      })
      .catch(() => {
        // Never block the page for a failed marquee fetch.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Measure one group's rendered width so the loop scrolls at a constant
  // speed regardless of how many awards (or how wide their logos) are.
  // ResizeObserver + load re-measure after the (lazy) images settle.
  useEffect(() => {
    if (awards.length === 0) return undefined;
    const group = trackRef.current?.children[0] as HTMLElement | undefined;
    if (!group) return undefined;
    const measure = () => setGroupWidth(group.offsetWidth);
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(group);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('load', measure);
      observer?.disconnect();
    };
  }, [awards.length]);

  if (awards.length === 0) return null;

  // Measured width preferred; estimate only until the first paint.
  const duration =
    groupWidth > 0
      ? Math.max(6, groupWidth / MARQUEE_SPEED_PX_PER_SEC)
      : Math.max(12, Math.min(60, awards.length * 5));

  const group = (duplicate: boolean) => (
    <div className="awards-group" aria-hidden={duplicate ? 'true' : undefined}>
      {awards.map((award) => (
        <React.Fragment key={award.id}>
          <Link to={`/awards/${award.id}`} className="award-chip">
            {award.image ? (
              <img src={mediaUrl(award.image)} alt="" loading="lazy" decoding="async" />
            ) : (
              <Award size={56} className="award-icon" aria-hidden="true" />
            )}
            <span className="award-title">{award.title}</span>
          </Link>
          <span className="award-sep" aria-hidden="true">★</span>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <section className="awards-band" aria-label="Awards and recognition">
      <h2 className="awards-title">Awards &amp; Recognition</h2>
      <div className="awards-marquee">
        <div
          ref={trackRef}
          className="awards-track"
          style={{ animationDuration: `${duration}s` }}
        >
          {group(false)}
          {group(true)}
        </div>
      </div>
    </section>
  );
};

export default AwardsMarquee;
