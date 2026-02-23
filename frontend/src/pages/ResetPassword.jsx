import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { auth } from '../api/client';
import AuthLayout from '../components/AuthLayout';
import './Auth.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== passwordConfirmation) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await auth.resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const msg = err.response?.data?.errors?.email
        ? err.response.data.errors.email[0]
        : err.response?.data?.message || 'Something went wrong.';
      setError(msg);
    }
  };

  if (!token || !email) {
    return (
      <AuthLayout>
        <div className="auth-card auth-card--gradient">
          <div className="auth-card-header">
            <h1 className="auth-title-with-lines">Invalid reset link</h1>
            <p className="auth-subtitle">
              This link is invalid or has expired. Request a new password reset.
            </p>
          </div>
          <p className="auth-footer auth-footer--light">
            <Link to="/forgot-password">Request new link</Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout>
        <div className="auth-card auth-card--gradient">
          <div className="auth-card-header">
            <h1 className="auth-title-with-lines">Password reset</h1>
            <p className="auth-subtitle">Your password has been updated. Redirecting to sign in…</p>
          </div>
          <p className="auth-footer auth-footer--light">
            <Link to="/login">Sign in now</Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="auth-card auth-card--gradient">
        <div className="auth-card-header">
          <h1 className="auth-title-with-lines">Set new password</h1>
          <p className="auth-subtitle">Enter your new password below.</p>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          <label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>
          <label>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="Confirm new password"
              required
              autoComplete="new-password"
            />
          </label>
          <button type="submit"><Lock size={18} /> Reset password</button>
        </form>
        <div className="auth-divider auth-divider--light" aria-hidden />
        <p className="auth-footer auth-footer--light">
          <Link to="/login">Back to Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
