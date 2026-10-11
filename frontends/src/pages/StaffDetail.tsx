import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { IStaff } from 'shared/schema';
import { usePublicItem } from '../hooks/usePublicResource';
import { mediaUrl } from '../lib/upload';
import { Skeleton } from '../components/Skeleton';

const StaffDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    item: member,
    loading,
    error,
    notFound,
  } = usePublicItem<IStaff>('/api/admin/staff', id);

  if (loading) {
    return (
      <div>
        <Skeleton width="40%" height={28} />
        <div style={{ height: 16 }} />
        <Skeleton width="100%" height={260} />
        <div style={{ height: 16 }} />
        <Skeleton width="100%" height={14} />
        <div style={{ height: 8 }} />
        <Skeleton width="90%" height={14} />
      </div>
    );
  }

  if (error || notFound || !member) {
    return (
      <div className="error-state">
        <h2>Staff member not found</h2>
        <Link to="/staff" className="btn btn-primary">
          Back to staff
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">{member.name}</h1>
      <p className="page-description">{member.position}</p>

      <div className="staff-detail">
        <div className="staff-detail-image">
          <img src={mediaUrl(member.image)} alt={member.name} fetchPriority="high" decoding="async" />
        </div>
        <div className="staff-detail-content">
          <span className="badge badge-primary">{member.position}</span>
          <p className="staff-detail-department">{member.department}</p>
          <p className="staff-detail-bio">{member.bio}</p>
          {member.welcomeMessage && (
            <div className="staff-detail-welcome">
              <h4>A Message from {member.name.split(' ').slice(-1)}</h4>
              <blockquote>{member.welcomeMessage}</blockquote>
            </div>
          )}
          <div className="staff-detail-contact">
            <h4>Contact</h4>
            <p>
              <a href={`mailto:${member.email}`}>{member.email}</a>
            </p>
            <p>{member.phone}</p>
            <p>{member.address}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetail;
