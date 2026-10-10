import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  Megaphone,
  Newspaper,
  Plus,
  GraduationCap,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/ThemeContext';
import { Skeleton } from '../components/Skeleton';

interface Counts {
  programmes: number;
  news: number;
  events: number;
  staff: number;
  gallery: number;
  slides: number;
}

const EMPTY_COUNTS: Counts = {
  programmes: 0,
  news: 0,
  events: 0,
  staff: 0,
  gallery: 0,
  slides: 0,
};

/** Fetch a paginated admin endpoint and return just the total count. */
async function fetchCount(url: string): Promise<number> {
  try {
    const res = await fetch(`${url}?limit=1`);
    if (!res.ok) return 0;
    const data = await res.json().catch(() => ({}));
    const total = data?.pagination?.total;
    if (typeof total === 'number') return total;
    return Array.isArray(data?.items) ? data.items.length : 0;
  } catch {
    return 0;
  }
}

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  tone: string;
  to: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, tone, to }) => (
  <Link to={to} className={`stat-card ${tone} stat-card-link`}>
    <div className="stat-card-icon" aria-hidden="true">{icon}</div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </Link>
);

interface QuickActionProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const QuickAction: React.FC<QuickActionProps> = ({ to, icon, title, description }) => (
  <Link to={to} className="quick-action-card">
    <div className="quick-action-icon" aria-hidden="true">{icon}</div>
    <div className="quick-action-text">
      <div className="quick-action-title">{title}</div>
      <div className="quick-action-desc">{description}</div>
    </div>
    <Plus size={18} aria-hidden="true" className="quick-action-plus" />
  </Link>
);

const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const [counts, setCounts] = useState<Counts>(EMPTY_COUNTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [programmes, news, events, staff, gallery, slides] = await Promise.all([
        fetchCount('/api/admin/programmes'),
        fetchCount('/api/admin/news'),
        fetchCount('/api/admin/events'),
        fetchCount('/api/admin/staff'),
        fetchCount('/api/admin/gallery'),
        fetchCount('/api/admin/home-slides'),
      ]);
      setCounts({ programmes, news, events, staff, gallery, slides });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats: StatCardProps[] = [
    { icon: <GraduationCap size={22} />, value: counts.programmes, label: 'Programmes', tone: 'plan', to: '/admin/programmes' },
    { icon: <Newspaper size={22} />, value: counts.news, label: 'News Articles', tone: 'people', to: '/admin/news' },
    { icon: <CalendarDays size={22} />, value: counts.events, label: 'Events', tone: 'events', to: '/admin/events' },
    { icon: <Users size={22} />, value: counts.staff, label: 'Staff Members', tone: 'projects', to: '/admin/staff' },
    { icon: <ImageIcon size={22} />, value: counts.gallery, label: 'Gallery Images', tone: 'plan', to: '/admin/gallery' },
    { icon: <Megaphone size={22} />, value: counts.slides, label: 'Homepage Slides', tone: 'people', to: '/admin/home' },
  ];

  const quickActions: QuickActionProps[] = [
    { to: '/admin/programmes/new', icon: <GraduationCap size={18} />, title: 'New Programme', description: 'Add an academic programme' },
    { to: '/admin/news/new', icon: <Newspaper size={18} />, title: 'New Article', description: 'Publish a news story' },
    { to: '/admin/events/new', icon: <CalendarDays size={18} />, title: 'New Event', description: 'Schedule a department event' },
    { to: '/admin/staff/new', icon: <Users size={18} />, title: 'New Staff', description: 'Add a staff profile' },
    { to: '/admin/gallery', icon: <ImageIcon size={18} />, title: 'Upload Images', description: 'Grow the media library' },
    { to: '/admin/home/new', icon: <Megaphone size={18} />, title: 'New Slide', description: 'Add a homepage banner' },
  ];

  return (
    <div>
      <div className="dashboard-hero">
        <div>
          <h1>
            <LayoutDashboard size={24} aria-hidden="true" /> Dashboard
          </h1>
          <p>Overview of the Department of Built Environment website.</p>
        </div>
        <div className="dashboard-hero-actions">
          <Link to="/admin/notices" className="btn btn-outline">
            <FileText size={15} aria-hidden="true" /> Notices
          </Link>
          <Link to="/admin/contacts" className="btn btn-outline">
            <FileText size={15} aria-hidden="true" /> Contacts
          </Link>
        </div>
      </div>

      {error && <div className="login-error">{error}</div>}

      <div className="admin-section">
        <div className="admin-section-header">
          <h2>Content at a glance</h2>
          <button className="btn btn-sm btn-outline" onClick={() => void load()} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <div className="stats-grid">
          {loading
            ? Array.from({ length: stats.length }).map((_, i) => (
                <div className="stat-card" key={i} aria-hidden="true">
                  <Skeleton width={44} height={44} radius={10} />
                  <div style={{ height: 12 }} />
                  <Skeleton width="45%" height={30} />
                  <div style={{ height: 6 }} />
                  <Skeleton width="70%" height={12} />
                </div>
              ))
            : stats.map((s) => (
                <StatCard key={s.label} {...s} />
              ))}
        </div>
      </div>

      <div className="admin-section">
        <div className="admin-section-header">
          <h2>Quick actions</h2>
        </div>
        <div className="quick-actions-grid">
          {quickActions.map((a) => (
            <QuickAction key={a.to} {...a} />
          ))}
        </div>
      </div>

      {token === null && (
        <p className="text-muted">
          You are browsing in read-only mode. Some counts may be limited.
        </p>
      )}
    </div>
  );
};

export default AdminDashboard;

