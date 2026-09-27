import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="brand">
            ClinicQ
          </Link>

          <nav className="nav" aria-label="Main">
            {user?.role === 'ADMIN' ? (
              <NavLink to="/admin">All appointments</NavLink>
            ) : (
              <>
                <NavLink to="/doctors">Doctors</NavLink>
                {user && <NavLink to="/appointments">My appointments</NavLink>}
              </>
            )}
          </nav>

          <div className="header-user">
            {user ? (
              <>
                <span className="muted">{user.name}</span>
                <button
                  type="button"
                  className="button button-small button-ghost"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login">Log in</NavLink>
                <Link to="/register" className="button button-small">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container main">
        <Outlet />
      </main>
    </>
  );
}
