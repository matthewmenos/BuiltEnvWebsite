import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import { IBreadcrumb, IProgramme } from 'shared/schema';
import { publicApi } from '../lib/publicApi';
import { mediaUrl } from '../lib/upload';
import { TableSkeleton } from '../components/Skeleton';

const breadcrumbs: IBreadcrumb[] = [
  { label: 'Home', href: '/' },
  { label: 'Programmes', href: '/programmes' },
];

const Programmes: React.FC = () => {
  const [programmes, setProgrammes] = useState<IProgramme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    publicApi
      .listProgrammes()
      .then((items) => {
        if (!cancelled) setProgrammes(items);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Could not load programmes');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href || crumb.label}>
              {index > 0 && <li className="breadcrumb-divider">/</li>}
              {crumb.href ? (
                <li className="breadcrumb-item">
                  <a href={crumb.href}>{crumb.label}</a>
                </li>
              ) : (
                <li className="breadcrumb-item" aria-current="page">
                  {crumb.label}
                </li>
              )}
            </React.Fragment>
          ))}
        </ol>
      </nav>

      <h1 className="page-title">Programmes</h1>
      <p className="page-description">
        Our programmes are designed to prepare you for a successful career
        in the built environment.
      </p>

      <div className="programmes-grid">
        {loading ? (
          <TableSkeleton rows={4} columns={1} />
        ) : error ? (
          <div className="login-error">{error}</div>
        ) : programmes.length === 0 ? (
          <div className="empty-state">
            No programmes have been published yet. Please check back soon.
          </div>
        ) : (
          programmes.map((programme: IProgramme) => (
          <Link to={`/programmes/${programme.id}`} className="card programme-card" key={programme.id}>
            <div className="programme-image">
              <img src={mediaUrl(programme.image)} alt={programme.title} loading="lazy" decoding="async" />
            </div>
            <div className="programme-content">
              <span className="badge badge-primary">{programme.shortCode}</span>
              <h3 className="programme-title">{programme.title}</h3>
              <p className="programme-faculty">Faculty of {programme.faculty}</p>
              <p className="programme-description">{programme.description}</p>
              <div className="programme-meta">
                <span className="meta-item">
                  <Calendar size={14} aria-hidden="true" /> {programme.duration}
                </span>
                <span className="meta-item">
                  <MapPin size={14} aria-hidden="true" /> {programme.location}
                </span>
              </div>
              <div className="programme-actions">
                <Link to={`/programmes/${programme.id}`} className="btn btn-sm btn-primary">
                  View Details
                </Link>
              </div>
            </div>
          </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Programmes;
