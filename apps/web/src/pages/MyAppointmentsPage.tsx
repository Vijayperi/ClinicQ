import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import { cancelAppointment, fetchMyAppointments } from '../api/appointments';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loading } from '../components/Loading';
import { StatusBadge } from '../components/StatusBadge';
import { useApiData } from '../hooks';
import type { Appointment } from '../types';
import { canCancel, isUpcoming } from '../utils/appointments';
import { formatDateTime } from '../utils/format';

export function MyAppointmentsPage() {
  const location = useLocation();
  const { data, error, isLoading, reload } = useApiData(fetchMyAppointments);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<Error | null>(null);
  const [message, setMessage] = useState<string | null>(
    (location.state as { message?: string } | null)?.message ?? null,
  );

  async function handleCancel(appointment: Appointment) {
    const confirmed = window.confirm(
      `Cancel your appointment with ${appointment.slot.doctor.name} on ${formatDateTime(appointment.slot.startsAt)}?`,
    );
    if (!confirmed) return;

    setActionError(null);
    setMessage(null);
    setCancellingId(appointment.id);
    try {
      await cancelAppointment(appointment.id);
      setMessage('Your appointment was cancelled.');
      reload();
    } catch (err) {
      setActionError(err as Error);
    } finally {
      setCancellingId(null);
    }
  }

  if (isLoading && !data) return <Loading label="Loading your appointments…" />;
  if (error) return <ErrorMessage error={error} onRetry={reload} />;
  if (!data) return null;

  const upcoming = data.appointments.filter((a) => isUpcoming(a));
  const pastOrCancelled = data.appointments.filter((a) => !isUpcoming(a));

  return (
    <section>
      <h1>My appointments</h1>

      {message && (
        <div className="alert alert-success" role="status">
          {message}
        </div>
      )}
      {actionError && <ErrorMessage error={actionError} />}

      <h2>Upcoming</h2>
      {upcoming.length === 0 ? (
        <EmptyState title="You have no upcoming appointments.">
          <Link to="/doctors" className="button">
            Book an appointment
          </Link>
        </EmptyState>
      ) : (
        <ul className="list">
          {upcoming.map((appointment) => (
            <AppointmentRow key={appointment.id} appointment={appointment}>
              {canCancel(appointment) ? (
                <button
                  type="button"
                  className="button button-small button-danger"
                  onClick={() => handleCancel(appointment)}
                  disabled={cancellingId === appointment.id}
                >
                  {cancellingId === appointment.id ? 'Cancelling…' : 'Cancel'}
                </button>
              ) : (
                <span className="hint">Too close to cancel online</span>
              )}
            </AppointmentRow>
          ))}
        </ul>
      )}

      {pastOrCancelled.length > 0 && (
        <>
          <h2>Past and cancelled</h2>
          <ul className="list">
            {pastOrCancelled.map((appointment) => (
              <AppointmentRow key={appointment.id} appointment={appointment} />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function AppointmentRow({
  appointment,
  children,
}: {
  appointment: Appointment;
  children?: ReactNode;
}) {
  return (
    <li className="card appointment-row">
      <div>
        <p className="appointment-time">{formatDateTime(appointment.slot.startsAt)}</p>
        <p className="muted">
          {appointment.slot.doctor.name} · {appointment.slot.doctor.specialty}
        </p>
      </div>
      <div className="actions">
        <StatusBadge status={appointment.status} />
        {children}
      </div>
    </li>
  );
}
