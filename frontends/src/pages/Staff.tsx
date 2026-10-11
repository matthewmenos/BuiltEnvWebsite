import React from 'react';
import { Link } from 'react-router-dom';
import { IStaff } from 'shared/schema';
import { usePublicList } from '../hooks/usePublicResource';
import { CardGridSkeleton } from '../components/Skeleton';

const Staff: React.FC = () => {
  const { items: members, loading, error } = usePublicList<IStaff>(
    '/api/admin/staff',
    100
  );

  return (
    <div>
      <h1 className="page-title">Our Staff</h1>
      <p className="page-description">
        Meet the academic and professional staff who make the Department of
        Built Environment a vibrant community of learning and research.
      </p>

      {loading ? (
        <CardGridSkeleton cards={6} />
      ) : error ? (
        <div className="login-error">{error}</div>
      ) : members.length === 0 ? (
        <div className="empty-state">
          No staff profiles have been published yet. Please check back soon.
        </div>
      ) : (
      <div className="staff-grid">
        {members.map((member: IStaff) => (
          <Link to={`/staff/${member.id}`} className="card staff-card" key={member.id}>
            <div className="staff-image">
              <img src={member.image} alt={member.name} />
            </div>
            <div className="staff-content">
              <h3 className="staff-name">{member.name}</h3>
              <p className="staff-position">{member.position}</p>
              <p className="staff-department">{member.department}</p>
              <p className="staff-bio">{member.bio}</p>
              <div className="staff-actions">
                <Link to={`/staff/${member.id}`} className="btn btn-sm btn-primary">
                  View Profile
                </Link>
              </div>
            </div>
          </Link>
        ))}
      </div>
      )}
    </div>
  );
};

export default Staff;
