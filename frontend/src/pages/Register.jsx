import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    company_name: '',
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' ')
        : err.response?.data?.message || 'Registration failed.';
      setError(msg);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-logo-wrap">
        <Link to="/">
          <img src="/logo1.png" alt="FH CRM" className="auth-logo" />
        </Link>
      </div>
      <div className="auth-card auth-card--wide">
        <Link to="/" className="auth-back-link">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="auth-card-header">
          <div className="auth-icon-wrap" aria-hidden>
            <UserPlus size={24} />
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join our marketing platform today</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-form-grid">
            <label>
              Full Name
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="John Doe"
                required
              />
            </label>

            <label>
              Work Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="john@company.com"
                required
              />
            </label>

            <label>
              Company Name
              <input
                value={form.company_name}
                onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
                placeholder="Company Inc."
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </label>

            <label style={{ gridColumn: 'span 2' }}>
              Confirm Password
              <input
                type="password"
                value={form.password_confirmation}
                onChange={(e) => setForm((f) => ({ ...f, password_confirmation: e.target.value }))}
                placeholder="••••••••"
                required
              />
            </label>
          </div>

          <button type="submit">Create Account</button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
