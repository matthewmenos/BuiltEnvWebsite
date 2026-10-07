import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { programmes as programmesData } from '../data/programmes';
import { IBreadcrumb, IProgramme } from 'shared/schema';

const breadcrumbs: IBreadcrumb[] = [
  { label: 'Home', href: '/' },
  { label: 'Programmes', href: '/programmes' },
  { label: 'Programme Details', href: '/programmes' },
];

const ProgrammeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const programme = programmesData.find((p: IProgramme) => p.id === id);

  if (!programme) {
    return (
      <div className="error-state">
        <h2>Programme not found</h2>
        <Link to="/programmes" className="btn btn-primary">
          Back to programmes
        </Link>
      </div>
    );
  }

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

      <div className="programme-detail">
        <div className="programme-detail-header">
          <div className="programme-detail-image">
            <img src={programme.image} alt={programme.title} />
          </div>
          <div className="programme-detail-content">
            <span className="badge badge-primary">{programme.shortCode}</span>
            <h1 className="programme-detail-title">{programme.title}</h1>
            <p className="programme-detail-faculty">Faculty of {programme.faculty}</p>
          </div>
        </div>

        <div className="programme-detail-body">
          <div className="programme-detail-section">
            <h2>About</h2>
            <p>{programme.description}</p>
          </div>

          <div className="programme-detail-section">
            <h2>Entry Requirements</h2>
            <p><strong>Admission:</strong> {programme.admission}</p>
          </div>

          <div className="programme-detail-section">
            <h2>Fees</h2>
            <p>
              <span className="fee-label">EU/UK:</span>{' '}
              {programme.euFees}
            </p>
            <p>
              <span className="fee-label">International:</span>{' '}
              {programme.nonEuFees}
            </p>
          </div>

          <div className="programme-detail-section">
            <h2>Duration</h2>
            <p>{programme.duration}</p>
          </div>

          <div className="programme-detail-section">
            <h2>Accreditation</h2>
            <p>{programme.accreditation}</p>
          </div>

          <div className="programme-detail-section">
            <h2>Programme Structure</h2>
            <p>{programme.structure}</p>
          </div>
        </div>

        <div className="programme-detail-footer">
          <Link to="/programmes" className="btn btn-outline">
            Back to Programmes
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProgrammeDetail;
