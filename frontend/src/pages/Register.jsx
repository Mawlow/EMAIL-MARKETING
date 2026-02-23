import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
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
      <div className="auth-card auth-card--register auth-card--gradient">
        <div className="auth-card-header">
          <div className="auth-icon-wrap" aria-hidden>
            <User size={32} strokeWidth={1.5} />
          </div>
          <h1>Create account</h1>
          <p className="auth-subtitle">Register your company</p>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          <label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Your name"
              required
            />
          </label>
          <label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="Email"
              required
            />
          </label>
          <label>
            <input
              value={form.company_name}
              onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
              placeholder="Company name"
              required
            />
          </label>
          <label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Password (min 8 characters)"
              required
              minLength={8}
            />
          </label>
          <label>
            <input
              type="password"
              value={form.password_confirmation}
              onChange={(e) => setForm((f) => ({ ...f, password_confirmation: e.target.value }))}
              placeholder="Confirm password"
              required
            />
          </label>
          <button type="submit">Create Account</button>
        </form>
        <div className="auth-divider auth-divider--light" aria-hidden />
        <p className="auth-footer auth-footer--light">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
