import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquareText, Pencil, Plus, Trash2 } from 'lucide-react';
import { staff as seedStaff } from '../data/staff';
import { useAuth } from '../context/ThemeContext';

const AdminStaff: React.FC = () => {
  const { token } = useAuth();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    setError('');
    setRemovingId(id);
    try {
      const response = await fetch(`/api/admin/staff/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Delete failed');
      }
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      setRemovingId(null);
    }
  };

  return (
    <div>
      <h1 className="page-title">Staff</h1>
      <p className="page-description">
        Manage department staff profiles. The Head of Department&apos;s welcome
        message (edited via the form) appears on the homepage.
      </p>
      <div className="admin-section-header">
        <h2>All Staff Members</h2>
        <Link to="/admin/staff/new" className="btn btn-primary">
          <Plus size={15} aria-hidden="true" /> Add New Staff
        </Link>
      </div>
      {error && <div className="login-error">{error}</div>}
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Position</th>
              <th>Department</th>
              <th>Welcome</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {seedStaff.map((member) => (
              <tr key={member.id}>
                <td>{member.name}</td>
                <td>{member.position}</td>
                <td>{member.department}</td>
                <td>
                  {member.welcomeMessage ? (
                    <span className="badge badge-primary" title={member.welcomeMessage}>
                      <MessageSquareText size={12} aria-hidden="true" /> Set
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td>
                  <div className="table-actions">
                    <Link to={`/admin/staff/${member.id}/edit`} className="btn btn-sm btn-outline">
                      <Pencil size={13} aria-hidden="true" /> Edit
                    </Link>
                    <button
                      className="btn btn-sm btn-outline btn-delete"
                      onClick={() => handleDelete(member.id, member.name)}
                      disabled={removingId === member.id}
                    >
                      <Trash2 size={13} aria-hidden="true" />
                      {removingId === member.id ? ' Deleting...' : ' Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminStaff;
