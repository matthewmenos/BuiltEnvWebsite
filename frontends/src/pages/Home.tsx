import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  Download,
  FileText,
  GraduationCap,
  Images,
  Mail,
  MapPin,
  Microscope,
  Newspaper,
  Phone,
  Users,
} from 'lucide-react';
import { programmes as programmesData } from '../data/programmes';
import { news as newsData } from '../data/news';
import { events as eventsData } from '../data/events';
import { staff as staffData } from '../data/staff';
import { galleryItems as galleryData } from '../data/gallery';
import { Notice as noticesData, type Notice } from '../data/notices';
import { IEvent, INews } from 'shared/schema';

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const Home: React.FC = () => {
  const hod = staffData[0] ?? {
    id: 'hod',
    name: 'Head of Department',
    position: 'Head, Department of Built Environment',
    department: 'Built Environment',
    email: 'info@pentvars.edu.gh',
    phone: '+233 302 417 064',
    address: 'Pentecost University, Sowutuom, Accra, Ghana',
    bio: '',
    image: '/assets/logos/department-logo.jpg',
  };
  const featuredProgrammes = programmesData.slice(0, 4);
  const latestNews: INews[] = [...newsData]
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    .slice(0, 3);
  const upcomingEvents: IEvent[] = [...eventsData]
    .sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime))
    .slice(0, 3);
  const featuredStaff = staffData.slice(0, 4);
  const galleryPreview = galleryData.slice(0, 4);
  const activeNotices: Notice[] = noticesData
    .filter((n) => n.status === 'Active')
    .slice(0, 3);
  return (
    <div className="home">
      {/* 1 — HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <p className="hero-eyebrow">Pentecost University &middot; Sowutuom, Accra</p>
            <h1 className="hero-title">Building the future of the built environment</h1>
            <p className="hero-subtitle">
              Quantity Surveying, Construction, Architecture and Planning — taught
              through faith-driven scholarship, industry practice and research.
            </p>
            <div className="hero-actions">
              <Link to="/programmes" className="btn btn-primary">
                Explore Programmes <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link to="/contact" className="btn btn-outline">
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — WELCOME FROM THE HEAD OF DEPARTMENT */}
      <section className="container home-section">
        <div className="section-head">
          <h2 className="section-title">Welcome from the Head of Department</h2>
          <Link to="/staff" className="section-link">
            Meet our staff <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <div className="card hod-card">
          <div className="hod-photo">
            <img src={hod.image} alt={hod.name} />
          </div>
          <div className="hod-body">
            <h3>{hod.name}</h3>
            <p className="hod-role">{hod.position}</p>
            <p className="hod-message">
              {hod.welcomeMessage ?? hod.bio}
            </p>
            <div className="hod-actions">
              <Link to={`/staff/${hod.id}`} className="btn btn-sm btn-outline">
                Read full profile
              </Link>
              <Link to="/contact" className="btn btn-sm btn-primary">
                Talk to admissions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3 — OUR PROGRAMMES */}
      <section className="container home-section">
        <div className="section-head">
          <h2 className="section-title">Our Programmes</h2>
          <Link to="/programmes" className="section-link">
            All programmes <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <div className="programmes-grid">
          {featuredProgrammes.map((programme) => (
            <Link
              to={`/programmes/${programme.id}`}
              className="card programme-card"
              key={programme.id}
            >
              <div className="programme-image">
                <img src={programme.image} alt={programme.title} />
              </div>
              <div className="programme-content">
                <span className="badge badge-primary">{programme.shortCode}</span>
                <h3 className="programme-title">{programme.title}</h3>
                <p className="programme-description">{programme.description}</p>
                <span className="card-cta">
                  <GraduationCap size={15} aria-hidden="true" /> View programme
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4 — LATEST NEWS */}
      <section className="home-band">
        <div className="container home-section">
          <div className="section-head">
            <h2 className="section-title">Latest News</h2>
            <Link to="/news" className="section-link">
              All news <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className="news-grid">
            {latestNews.map((article) => (
              <Link to={`/news/${article.id}`} className="card news-card" key={article.id}>
                <div className="news-image">
                  <img src={article.image} alt={article.title} />
                </div>
                <div className="news-content">
                  <span className="badge badge-primary">{article.category}</span>
                  <h3 className="news-title">{article.title}</h3>
                  <p className="news-summary">{article.summary}</p>
                  <p className="news-meta">
                    <Newspaper size={13} aria-hidden="true" /> By {article.author} &middot;{' '}
                    <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5 — RESEARCH & INNOVATION */}
      <section className="container home-section">
        <div className="section-head">
          <h2 className="section-title">Research &amp; Innovation</h2>
          <span className="section-note">Climate resilience &middot; Low-carbon materials &middot; Sustainable communities</span>
        </div>
        <div className="features-grid">
          <div className="card feature-card">
            <div className="feature-icon">
              <Microscope size={28} aria-hidden="true" />
            </div>
            <h3 className="feature-title">Climate Resilience Lab</h3>
            <p className="feature-description">
              Applied research on flood-resilient housing, heat-responsive design
              and infrastructure for Ghanaian cities.
            </p>
          </div>
          <div className="card feature-card">
            <div className="feature-icon">
              <Building2 size={28} aria-hidden="true" />
            </div>
            <h3 className="feature-title">Materials Innovation</h3>
            <p className="feature-description">
              Testing low-carbon binders, laterite composites and durable local
              materials for affordable construction.
            </p>
          </div>
          <div className="card feature-card">
            <div className="feature-icon">
              <Award size={28} aria-hidden="true" />
            </div>
            <h3 className="feature-title">Industry Partnerships</h3>
            <p className="feature-description">
              Live briefs, guest studios and placement routes with quantity
              surveying, contracting and planning practices.
            </p>
          </div>
        </div>
      </section>

      {/* 6 — UPCOMING EVENTS */}
      <section className="home-band">
        <div className="container home-section">
          <div className="section-head">
            <h2 className="section-title">Upcoming Events</h2>
            <Link to="/events" className="section-link">
              All events <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className="events-grid">
            {upcomingEvents.map((event) => (
              <Link to={`/events/${event.id}`} className="card event-card" key={event.id}>
                <div className="event-image">
                  <img src={event.image} alt={event.title} />
                </div>
                <div className="event-content">
                  <span className="badge badge-primary">{event.category}</span>
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-date meta-item">
                    <CalendarDays size={14} aria-hidden="true" /> {formatDate(event.startTime)}
                  </p>
                  <p className="event-location meta-item">
                    <MapPin size={14} aria-hidden="true" /> {event.location}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7 — MEET OUR STAFF */}
      <section className="container home-section">
        <div className="section-head">
          <h2 className="section-title">Meet Our Staff</h2>
          <Link to="/staff" className="section-link">
            All staff <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <div className="staff-grid">
          {featuredStaff.map((member) => (
            <Link to={`/staff/${member.id}`} className="card staff-card" key={member.id}>
              <div className="staff-image">
                <img src={member.image} alt={member.name} />
              </div>
              <div className="staff-content">
                <h3 className="staff-name">{member.name}</h3>
                <p className="staff-position">{member.position}</p>
                <span className="card-cta">
                  <Users size={15} aria-hidden="true" /> View profile
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 8 — STUDENT RESOURCES */}
      <section className="home-band">
        <div className="container home-section">
          <div className="section-head">
            <h2 className="section-title">Student Resources</h2>
            <span className="section-note">Timetable &middot; Notices &middot; Internship &middot; Downloads</span>
          </div>
          <div className="features-grid resources-grid">
            <div className="card feature-card">
              <div className="feature-icon">
                <BookOpen size={28} aria-hidden="true" />
              </div>
              <h3 className="feature-title">Timetable</h3>
              <p className="feature-description">
                Weekly lecture and studio schedules for every level, published
                each semester by the department.
              </p>
            </div>
            <div className="card feature-card">
              <div className="feature-icon">
                <Bell size={28} aria-hidden="true" />
              </div>
              <h3 className="feature-title">Latest Notices</h3>
              {activeNotices.length > 0 ? (
                <ul className="resource-list">
                  {activeNotices.map((notice) => (
                    <li key={notice.id}>
                      <strong>{notice.title}</strong>
                      <span>{formatDate(notice.date)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="feature-description">No active notices right now.</p>
              )}
            </div>
            <div className="card feature-card">
              <div className="feature-icon">
                <Briefcase size={28} aria-hidden="true" />
              </div>
              <h3 className="feature-title">Internship</h3>
              <p className="feature-description">
                Industrial attachment placements with partner firms, site
                supervision guides and logbook requirements.
              </p>
            </div>
            <div className="card feature-card">
              <div className="feature-icon">
                <Download size={28} aria-hidden="true" />
              </div>
              <h3 className="feature-title">Downloads</h3>
              <p className="feature-description">
                Handbooks, studio briefs, dissertation templates and
                departmental forms in one place.
              </p>
              <p className="resource-files">
                <span>
                  <FileText size={14} aria-hidden="true" /> Student handbook (PDF)
                </span>
                <span>
                  <FileText size={14} aria-hidden="true" /> Attachment logbook (PDF)
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9 — GALLERY */}
      <section className="container home-section">
        <div className="section-head">
          <h2 className="section-title">Gallery</h2>
          <Link to="/gallery" className="section-link">
            View gallery <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <div className="gallery-grid">
          {galleryPreview.map((item) => (
            <Link to={`/gallery/${item.id}`} className="gallery-item" key={item.id}>
              <div className="gallery-image">
                <img src={item.image} alt={item.title} />
              </div>
              <div className="gallery-overlay">
                <h3 className="gallery-title">{item.title}</h3>
                <p className="gallery-category">
                  <Images size={13} aria-hidden="true" /> {item.category}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 10 — CONTACT US */}
      <section className="home-band">
        <div className="container home-section contact-strip">
          <div>
            <h2 className="section-title">Contact Us</h2>
            <p className="section-lead">
              Questions about admissions, programmes or partnerships? The
              department office responds within two working days.
            </p>
            <ul className="contact-strip-list">
              <li>
                <Mail size={16} aria-hidden="true" /> info@pentvars.edu.gh
              </li>
              <li>
                <Phone size={16} aria-hidden="true" /> +233 302 417 064
              </li>
              <li>
                <MapPin size={16} aria-hidden="true" /> Pentecost University, Sowutuom, Accra, Ghana
              </li>
            </ul>
          </div>
          <div className="contact-strip-actions">
            <Link to="/contact" className="btn btn-primary">
              Send a message <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <a
              href="https://pentvars.edu.gh"
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
            >
              pentvars.edu.gh
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
