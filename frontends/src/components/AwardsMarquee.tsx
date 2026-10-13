import React, { useEffect, useState } from 'react';
import { Award } from 'lucide-react';
import type { IAward } from 'shared/schema';
import { publicApi } from '../lib/publicApi';
import { mediaUrl } from '../lib/upload';

/**
 * Scrolling awards marquee shown directly below the homepage hero.
 * Content comes from Admin → Awards; the whole strip stays hidden while
 * no awards exist. The track is rendered twice so the CSS loop is
 * seamless, auto-pauses on hover, and goes static for reduced-motion
 * users (matching the NoticeBar / hero conventions).
 */
const AwardsMarquee: React.FC = () => {
  const [awards, setAwards] = useState<IAward[]>([]);

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

  if (awards.length === 0) return null;

  // Roughly ~6s per award, clamped so very long/short lists still feel right.
  const duration = Math.min(90, Math.max(25, awards.length * 6));

  const group = (duplicate: boolean) => (
    <div className="awards-group" aria-hidden={duplicate ? 'true' : undefined}>
      {awards.map((award) => (
        <React.Fragment key={award.id}>
          <span className="award-chip">
            {award.image ? (
              <img src={mediaUrl(award.image)} alt="" loading="lazy" decoding="async" />
            ) : (
              <Award size={16} className="award-icon" aria-hidden="true" />
            )}
            <span className="award-title">{award.title}</span>
            {award.detail && <span className="award-detail">{award.detail}</span>}
          </span>
          <span className="award-sep" aria-hidden="true">★</span>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <section className="awards-band" aria-label="Awards and recognition">
      <span className="awards-band-label">Awards &amp; Recognition</span>
      <div className="awards-marquee">
        <div
          className={`awards-track${awards.length < 2 ? ' is-static' : ''}`}
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
