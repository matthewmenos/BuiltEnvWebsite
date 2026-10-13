import React, { useEffect, useState } from 'react';
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

  // Roughly ~8s per award, clamped so very long/short lists still feel right.
  const duration = Math.min(120, Math.max(30, awards.length * 8));

  const group = (duplicate: boolean) => (
    <div className="awards-group" aria-hidden={duplicate ? 'true' : undefined}>
      {awards.map((award) => (
        <React.Fragment key={award.id}>
          <Link to={`/awards/${award.id}`} className="award-chip">
            {award.image ? (
              <img src={mediaUrl(award.image)} alt="" loading="lazy" decoding="async" />
            ) : (
              <Award size={44} className="award-icon" aria-hidden="true" />
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
        <div className="awards-track" style={{ animationDuration: `${duration}s` }}>
          {group(false)}
          {group(true)}
        </div>
      </div>
    </section>
  );
};

export default AwardsMarquee;
