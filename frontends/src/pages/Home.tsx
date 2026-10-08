import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';
import { staff as staffData } from '../data/staff';

interface HomeSlide {
  id: string;
  imageUrl: string;
  altText: string;
  sortOrder: number;
  active: boolean;
}

const SLIDE_INTERVAL_MS = 6000;

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

  // --- Hero background carousel (managed in Admin → Homepage) ---
  const [slides, setSlides] = useState<HomeSlide[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/home-slides?limit=20');
        if (!res.ok) return;
        const data = await res.json().catch(() => ({}));
        if (cancelled || !Array.isArray(data.items)) return;
        const visible = (data.items as HomeSlide[])
          .filter(
            (s) => s && typeof s.imageUrl === 'string' && s.imageUrl && s.active !== false
          )
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        setSlides(visible);
      } catch {
        // API unreachable — the gradient hero fallback stays in place.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep the index inside the range whenever the slide list changes.
  useEffect(() => {
    setSlideIndex((i) => (slides.length > 0 && i >= slides.length ? 0 : i));
  }, [slides.length]);

  // Auto-advance; pauses on hover and is disabled for reduced-motion users.
  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      setSlideIndex((i) => (i + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [slides.length, paused]);

  const prevSlide = () =>
    setSlideIndex((i) => (i - 1 + slides.length) % slides.length);
  const nextSlide = () =>
    setSlideIndex((i) => (i + 1) % slides.length);

  return (
    <div className="home">
      {/* 1 — HERO WITH BACKGROUND CAROUSEL */}
      <section
        className="hero"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="hero-slides">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className={`hero-slide${i === slideIndex ? ' is-active' : ''}`}
              aria-hidden={i === slideIndex ? undefined : true}
            >
              <img
                src={slide.imageUrl}
                alt={
                  i === slideIndex
                    ? slide.altText || 'Department of Built Environment'
                    : ''
                }
              />
            </div>
          ))}
        </div>
        <div className="hero-overlay" />

        {slides.length > 1 && (
          <>
            <button
              type="button"
              className="hero-arrow hero-arrow-prev"
              onClick={prevSlide}
              aria-label="Previous slide"
            >
              <ChevronLeft size={22} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="hero-arrow hero-arrow-next"
              onClick={nextSlide}
              aria-label="Next slide"
            >
              <ChevronRight size={22} aria-hidden="true" />
            </button>
            <div className="hero-dots">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  className={i === slideIndex ? 'is-active' : ''}
                  onClick={() => setSlideIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === slideIndex ? 'true' : undefined}
                />
              ))}
            </div>
          </>
        )}

        <div className="container hero-container">
          <div className="hero-content">
            <p className="hero-eyebrow">
              Pentecost University &middot; Sowutuom, Accra
            </p>
            <h1 className="hero-title">
              Building the future of the built environment
            </h1>
            <p className="hero-subtitle">
              Quantity Surveying, Construction, Architecture and Planning —
              taught through faith-driven scholarship, industry practice and
              research.
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
          <h2 className="section-title">
            Welcome message from the Head of Department
          </h2>
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
            <p className="hod-message">{hod.welcomeMessage ?? hod.bio}</p>
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

      {/* 3 — CONTACT CTA BAND */}
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
                <MapPin size={16} aria-hidden="true" /> Pentecost University,
                Sowutuom, Accra, Ghana
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
