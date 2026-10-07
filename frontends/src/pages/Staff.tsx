import React from 'react';
import { Link } from 'react-router-dom';
import { staff as staffData } from '../data/staff';
import { IStaff } from 'shared/schema';

const Staff: React.FC = () => {
  return (
    <div>
      <h1 className="page-title">Our Staff</h1>
      <p className="page-description">
        Meet the academic and professional staff who make the Department of
        Built Environment a vibrant community of learning and research.
      </p>

      <div className="staff-grid">
        {staffData.map((member: IStaff) => (
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
    </div>
  );
};

export default Staff;
