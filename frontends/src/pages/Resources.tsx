import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Bell, Briefcase, Download, FileText } from 'lucide-react';
import { usePublicList } from '../hooks/usePublicResource';
import { Skeleton } from '../components/Skeleton';
import { mediaUrl } from '../lib/upload';

interface NoticeRow {
  id: string;
  title: string;
  body: string;
  postedAt?: string;
  expiresAt?: string | null;
}

interface ResourceFileRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  fileUrl: string;
  sortOrder: number | null;
  active: boolean;
}

/**
 * Renders a category's files as clickable download links (or a placeholder).
 * Loading mirrors the notice skeleton pattern; empty DB shows an empty state.
 */
const FileLinks: React.FC<{ files: ResourceFileRow[]; loading: boolean }> = ({
  files,
  loading,
}) => {
  if (loading) {
    return (
      <>
        <Skeleton width="70%" height={14} />
        <div style={{ height: 8 }} />
        <Skeleton width="55%" height={14} />
      </>
    );
  }
  if (files.length === 0) {
    return (
      <p className="resource-files-empty">
        No files published yet — check back soon.
      </p>
    );
  }
  return (
    <p className="resource-files">
      {files.map((file) => (
        <a
          key={file.id}
          href={mediaUrl(file.fileUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="resource-file-link"
          title={file.description || file.title}
        >
          <span>
            <FileText size={14} aria-hidden="true" /> {file.title}
          </span>
        </a>
      ))}
    </p>
  );
};

const Resources: React.FC = () => {
  const { items: notices, loading: noticesLoading } = usePublicList<NoticeRow>(
    '/api/admin/notices',
    100
  );
  const { items: files, loading: filesLoading } =
    usePublicList<ResourceFileRow>('/api/admin/resource-files', 100);

  const now = Date.now();
  const activeNotices = notices
    .filter((n) => !n.expiresAt || new Date(n.expiresAt).getTime() > now)
    .sort(
      (a, b) =>
        new Date(b.postedAt ?? 0).getTime() - new Date(a.postedAt ?? 0).getTime()
    )
    .slice(0, 6);

  // Only active files, grouped by category, ordered by display order.
  const filesFor = (category: string) =>
    files
      .filter((f) => f.active !== false && f.category === category)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const timetableFiles = filesFor('timetable');
  const internshipFiles = filesFor('internship');
  const downloadFiles = filesFor('downloads');

  return (
    <div>
      <h1 className="page-title">Student Resources</h1>
      <p className="page-description">
        Timetables, notices, internship information and downloads — everything
        departmental students need in one place.
      </p>

      <div className="features-grid resources-grid">
        <div className="card feature-card">
          <div className="feature-icon">
            <BookOpen size={28} aria-hidden="true" />
          </div>
          <h3 className="feature-title">Timetable</h3>
          <p className="feature-description">
            Weekly lecture and studio schedules for every level, published each
            semester by the department.
          </p>
          <FileLinks files={timetableFiles} loading={filesLoading} />
        </div>

        <div className="card feature-card">
          <div className="feature-icon">
            <Bell size={28} aria-hidden="true" />
          </div>
          <h3 className="feature-title">Latest Notices</h3>
          {noticesLoading ? (
            <>
              <Skeleton width="100%" height={14} />
              <div style={{ height: 8 }} />
              <Skeleton width="85%" height={14} />
            </>
          ) : activeNotices.length > 0 ? (
            <ul className="resource-list">
              {activeNotices.map((notice) => (
                <li key={notice.id}>
                  <Link
                    to={`/resources/notices/${notice.id}`}
                    className="resource-notice-link"
                  >
                    <strong>{notice.title}</strong>
                    <span>
                      {notice.postedAt
                        ? new Date(notice.postedAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : ''}
                    </span>
                  </Link>
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
          <FileLinks files={internshipFiles} loading={filesLoading} />
        </div>

        <div className="card feature-card">
          <div className="feature-icon">
            <Download size={28} aria-hidden="true" />
          </div>
          <h3 className="feature-title">Downloads</h3>
          <p className="feature-description">
            Handbooks, studio briefs, dissertation templates and departmental
            forms in one place.
          </p>
          <FileLinks files={downloadFiles} loading={filesLoading} />
        </div>
      </div>
    </div>
  );
};

export default Resources;