import React from 'react';
import { BookOpen, Bell, Briefcase, Download, FileText } from 'lucide-react';
import { Notice as noticesData, type Notice } from '../data/notices';

const Resources: React.FC = () => {
  const activeNotices: Notice[] = noticesData
    .filter((n) => n.status === 'Active')
    .slice(0, 6);

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
                  <span>
                    {new Date(notice.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
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
            Handbooks, studio briefs, dissertation templates and departmental
            forms in one place.
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
  );
};

export default Resources;
