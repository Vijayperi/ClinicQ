import { Navigate, Route, Routes } from 'react-router';
import { homePathFor, useAuth } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Layout } from './components/Layout';
import { Loading } from './components/Loading';
import { AdminAppointmentsPage } from './pages/AdminAppointmentsPage';
import { BookAppointmentPage } from './pages/BookAppointmentPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { LoginPage } from './pages/LoginPage';
import { MyAppointmentsPage } from './pages/MyAppointmentsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RegisterPage } from './pages/RegisterPage';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomeRedirect />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="doctors" element={<DoctorsPage />} />

        <Route element={<ProtectedRoute role="PATIENT" />}>
          <Route path="doctors/:doctorId" element={<BookAppointmentPage />} />
          <Route path="appointments" element={<MyAppointmentsPage />} />
        </Route>

        <Route element={<ProtectedRoute role="ADMIN" />}>
          <Route path="admin" element={<AdminAppointmentsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

// "/" sends each kind of user to their own starting page.
function HomeRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Loading />;
  return <Navigate to={user ? homePathFor(user) : '/doctors'} replace />;
}
