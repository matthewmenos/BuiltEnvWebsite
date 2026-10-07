import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { IStaff } from 'shared/schema';
import { staff as staffData } from '../data/staff';

const StaffDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const member = staffData.find((s: IStaff) => s.id === id);

  if (!member) {
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
          <img src={member.image} alt={member.name} />
        </div>
        <div className="staff-detail-content">
          <span className="badge badge-primary">{member.position}</span>
          <p className="staff-detail-department">{member.department}</p>
          <p className="staff-detail-bio">{member.bio}</p>
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
