import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { IStaff } from 'shared/schema';
import { staff as staffData } from '../data/staff';
import { useAuth } from '../context/ThemeContext';

const emptyForm = {
  name: '',
  position: '',
  department: 'Built Environment',
  email: '',
  phone: '',
  address: '',
  bio: '',
  welcomeMessage: '',
  image: '',
};

const AdminStaffForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { token } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isNew && id) {
      const existing = staffData.find((s: IStaff) => s.id === id);
      if (existing) {
        setForm({
          name: existing.name,
          position: existing.position,
          department: existing.department,
          email: existing.email,
          phone: existing.phone,
          address: existing.address,
          bio: existing.bio,
          welcomeMessage: existing.welcomeMessage ?? '',
          image: existing.image,
        });
      }
    }
  }, [id, isNew]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('saving');
    try {
      const response = await fetch(
        isNew ? '/api/admin/staff' : `/api/admin/staff/${id}`,
        {
          method: isNew ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(form),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Save failed');
      }
      navigate('/admin/staff');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
      setStatus('error');
    }
  };

  return (
    <div>
      <Link to="/admin/staff" className="btn btn-sm btn-outline">
        <ArrowLeft size={14} aria-hidden="true" /> Back to staff
      </Link>
      <h1 className="page-title">{isNew ? 'Add Staff Member' : 'Edit Staff Member'}</h1>
      <p className="page-description">
        The welcome message is shown on the homepage for the Head of Department
        and on the staff member&apos;s profile page.
      </p>

      {error && <div className="login-error">{error}</div>}

      <form className="card admin-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Full name *</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="position">Position *</label>
            <input id="position" name="position" value={form.position} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="department">Department</label>
            <input id="department" name="department" value={form.department} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="image">Photo URL *</label>
            <input id="image" name="image" value={form.image} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="address">Address</label>
          <input id="address" name="address" value={form.address} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="bio">Biography *</label>
          <textarea id="bio" name="bio" rows={5} value={form.bio} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="welcomeMessage">Welcome message (HOD speech)</label>
          <textarea
            id="welcomeMessage"
            name="welcomeMessage"
            rows={8}
            value={form.welcomeMessage}
            onChange={handleChange}
            placeholder="Shown on the homepage welcome card and the staff profile page. Leave blank for other staff."
          />
        </div>
        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={status === 'saving'}>
            <Save size={15} aria-hidden="true" />
            {status === 'saving' ? ' Saving...' : ' Save staff member'}
          </button>
          <Link to="/admin/staff" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AdminStaffForm;
