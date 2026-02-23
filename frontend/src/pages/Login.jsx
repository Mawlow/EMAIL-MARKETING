import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password, rememberMe);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card auth-card--gradient">
        <div className="auth-card-header">
          <div className="auth-icon-wrap" aria-hidden>
            <User size={32} strokeWidth={1.5} />
          </div>
          <h1 className="auth-title-with-lines">
            <span className="auth-title-line auth-title-line--left" />
            Sign In
            <span className="auth-title-line auth-title-line--right" />
          </h1>
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
          <label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              autoComplete="current-password"
            />
          </label>
          <button type="submit">Login</button>
        </form>
        <div className="auth-options">
          <label className="auth-remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Remember me</span>
          </label>
          <Link to="/forgot-password" className="auth-forgot">Forgot password?</Link>
        </div>
        <div className="auth-divider auth-divider--light" aria-hidden />
        <p className="auth-footer auth-footer--light">
          Not a member? <Link to="/register">Create Account</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
