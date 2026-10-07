import React from 'react';

const features = [
  {
    icon: '🎯',
    title: 'Innovative Programmes',
    description: 'Industry-aligned degrees that prepare you for the challenges of the built environment.',
  },
  {
    icon: '🔬',
    title: 'Research Excellence',
    description: 'Pioneering research that shapes sustainable urban development and construction.',
  },
  {
    icon: '🤝',
    title: 'Industry Partnerships',
    description: 'Work placements, guest lectures, and collaboration with leading built environment firms.',
  },
  {
    icon: '🌱',
    title: 'Sustainability Focus',
    description: 'Designing for a greener future with net-zero carbon buildings and communities.',
  },
];

const highlights = [
  {
    label: 'Accreditation',
    value: 'RICS & CIBSE accredited',
    icon: '✅',
  },
  {
    label: 'Student Body',
    value: '1,200+ undergraduates',
    icon: '🎓',
  },
  {
    label: 'Employability',
    value: '95% employed within 6 months',
    icon: '🚀',
  },
];

const stats = [
  { value: '1,200+', label: 'Students' },
  { value: '85+', label: 'Staff' },
  { value: '95%', label: 'Employment rate' },
  { value: '4.8/5', label: 'Student satisfaction' },
];

const Home: React.FC = () => {
  return (
    <div>
      {/* Hero section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Department of Built Environment
            </h1>
            <p className="hero-subtitle">
              Building the future of the built environment through
              innovative education, research, and practice.
            </p>
            <div className="hero-actions">
              <a href="/programmes" className="btn btn-primary">
                Explore Programmes
              </a>
              <a href="/news" className="btn btn-outline">
                Read Our News
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container">
        <div className="features-grid">
          {features.map((feature) => (
            <div className="card feature-card" key={feature.title}>
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Highlights */}
      <section className="highlights">
        <div className="container">
          <div className="highlights-grid">
            {highlights.map((h) => (
              <div className="highlight-card" key={h.label}>
                <div className="highlight-icon">{h.icon}</div>
                <div className="highlight-value">{h.value}</div>
                <div className="highlight-label">{h.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            {stats.map((s) => (
              <div className="stat-card" key={s.label}>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
