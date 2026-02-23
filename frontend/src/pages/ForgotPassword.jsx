import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { auth } from '../api/client';
import AuthLayout from '../components/AuthLayout';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await auth.forgotPassword(email);
      setSent(true);
    } catch (err) {
      const msg = err.response?.data?.errors?.email
        ? err.response.data.errors.email[0]
        : err.response?.data?.message || 'Something went wrong.';
      setError(msg);
    }
  };

  if (sent) {
    return (
      <AuthLayout>
        <div className="auth-card auth-card--gradient">
          <div className="auth-card-header">
            <h1 className="auth-title-with-lines">
              <span className="auth-title-line auth-title-line--left" />
              Check your email
              <span className="auth-title-line auth-title-line--right" />
            </h1>
            <p className="auth-subtitle">
              If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
            </p>
          </div>
          <p className="auth-footer auth-footer--light">
            <Link to="/login">Back to Sign in</Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="auth-card auth-card--gradient">
        <div className="auth-card-header">
          <h1 className="auth-title-with-lines">
            <span className="auth-title-line auth-title-line--left" />
            Forgot password?
            <span className="auth-title-line auth-title-line--right" />
          </h1>
          <p className="auth-subtitle">Enter your email and we&apos;ll send you a reset link.</p>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          <label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              autoComplete="email"
            />
          </label>
          <button type="submit"><Mail size={18} /> Send reset link</button>
        </form>
        <div className="auth-divider auth-divider--light" aria-hidden />
        <p className="auth-footer auth-footer--light">
          <Link to="/login">Back to Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
