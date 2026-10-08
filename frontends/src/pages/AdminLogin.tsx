import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/ThemeContext';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      // The API normally returns JSON, but proxies/load balancers can answer
      // with an HTML error page — don't blow up on response.json().
      let data: {
        token?: string;
        user?: { email?: string };
        error?: string;
      } | null = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.error || `Login failed (HTTP ${response.status}). Please try again.`
        );
      }

      // API returns { token, user: { email } } — persist the JWT so admin
      // API calls can send `Authorization: Bearer <token>`.
      if (!data?.token || !data.user?.email) {
        throw new Error('Login failed: malformed response');
      }
      login(data.user.email, data.token);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      if (err instanceof TypeError) {
        // fetch() network failure (API unreachable, dev proxy not running).
        setError('Could not reach the server. Please check your connection and try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Already signed in — send the admin straight to the dashboard.
  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <img
            src="/assets/logos/department-logo.jpg"
            alt="Department of Built Environment logo"
            className="login-logo-img"
          />
          <span className="logo-text">Department of Built Environment</span>
        </div>
        <h1 className="login-title">Admin Login</h1>
        <p className="login-subtitle">Access the administration area of the website</p>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="login-help">
          Contact the website administrator for access credentials.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
