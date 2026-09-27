import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <section className="state empty">
      <h1>Page not found</h1>
      <p className="muted">The page you asked for doesn’t exist.</p>
      <Link to="/" className="button">
        Go home
      </Link>
    </section>
  );
}
