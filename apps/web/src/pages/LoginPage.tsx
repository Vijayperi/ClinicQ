import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { homePathFor, useAuth } from '../auth/AuthContext';
import { ErrorMessage } from '../components/ErrorMessage';

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Where ProtectedRoute was trying to send them before asking them to log in.
  const from = (location.state as { from?: string } | null)?.from;

  if (user) {
    return <Navigate to={homePathFor(user)} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const loggedIn = await login(email, password);
      navigate(from ?? homePathFor(loggedIn), { replace: true });
    } catch (err) {
      setError(err as Error);
      setIsSubmitting(false);
    }
  }

  return (
    <section className="card form-card">
      <h1>Log in</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <ErrorMessage error={error} />}
        <button type="submit" className="button" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="muted">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </section>
  );
}
