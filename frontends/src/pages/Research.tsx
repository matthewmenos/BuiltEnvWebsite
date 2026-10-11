import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Beaker,
  BookOpen,
  Building2,
  FlaskConical,
  Lightbulb,
  Microscope,
} from 'lucide-react';
import { IResearchArea } from 'shared/schema';
import { usePublicList } from '../hooks/usePublicResource';
import { CardGridSkeleton } from '../components/Skeleton';

const ICONS: Record<string, React.ComponentType<{ size?: number | string; 'aria-hidden'?: boolean | 'true' | 'false' }>> = {
  microscope: Microscope,
  building: Building2,
  award: Award,
  beaker: Beaker,
  flask: FlaskConical,
  book: BookOpen,
  lightbulb: Lightbulb,
};

const Research: React.FC = () => {
  const { items, loading, error } = usePublicList<IResearchArea>(
    '/api/admin/research',
    50
  );
  const areas = items
    .filter((a) => a.active !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <div>
      <h1 className="page-title">Research &amp; Innovation</h1>
      <p className="page-description">
        Research in the Department of Built Environment connects faith-led
        scholarship with the practical challenges of Ghana&apos;s construction
        industry — from climate-resilient design to low-carbon materials.
      </p>

      {loading ? (
        <CardGridSkeleton cards={3} />
      ) : error ? (
        <div className="login-error">{error}</div>
      ) : areas.length === 0 ? (
        <div className="empty-state">
          No research areas have been published yet. Please check back soon.
        </div>
      ) : (
      <div className="features-grid">
        {areas.map((area) => {
          const Icon = ICONS[(area.icon || '').toLowerCase()] ?? Microscope;
          return (
          <div className="card feature-card" key={area.id}>
            <div className="feature-icon">
              <Icon size={28} aria-hidden="true" />
            </div>
            <h3 className="feature-title">{area.title}</h3>
            <p className="feature-description">{area.description}</p>
          </div>
          );
        })}
      </div>
      )}

      <div className="research-cta">
        <p>
          Interested in collaborating or pursuing postgraduate research with us?
        </p>
        <Link to="/contact" className="btn btn-primary">
          Contact the department <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
};

export default Research;
