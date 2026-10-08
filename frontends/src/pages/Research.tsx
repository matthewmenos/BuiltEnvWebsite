import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Building2, Microscope } from 'lucide-react';

const researchAreas = [
  {
    icon: Microscope,
    title: 'Climate Resilience Lab',
    description:
      'Applied research on flood-resilient housing, heat-responsive design and infrastructure for Ghanaian cities.',
  },
  {
    icon: Building2,
    title: 'Materials Innovation',
    description:
      'Testing low-carbon binders, laterite composites and durable local materials for affordable construction.',
  },
  {
    icon: Award,
    title: 'Industry Partnerships',
    description:
      'Live briefs, guest studios and placement routes with quantity surveying, construction and planning firms.',
  },
];

const Research: React.FC = () => {
  return (
    <div>
      <h1 className="page-title">Research &amp; Innovation</h1>
      <p className="page-description">
        Research in the Department of Built Environment connects faith-led
        scholarship with the practical challenges of Ghana&apos;s construction
        industry — from climate-resilient design to low-carbon materials.
      </p>

      <div className="features-grid">
        {researchAreas.map(({ icon: Icon, title, description }) => (
          <div className="card feature-card" key={title}>
            <div className="feature-icon">
              <Icon size={28} aria-hidden="true" />
            </div>
            <h3 className="feature-title">{title}</h3>
            <p className="feature-description">{description}</p>
          </div>
        ))}
      </div>

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
