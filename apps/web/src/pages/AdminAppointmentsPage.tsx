import { useState } from 'react';
import { fetchAllAppointments } from '../api/appointments';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loading } from '../components/Loading';
import { StatusBadge } from '../components/StatusBadge';
import { useApiData } from '../hooks';
import type { AppointmentStatus } from '../types';
import { formatDateTime } from '../utils/format';

type Filter = 'ALL' | AppointmentStatus;

export function AdminAppointmentsPage() {
  const { data, error, isLoading, reload } = useApiData(fetchAllAppointments);
  const [filter, setFilter] = useState<Filter>('ALL');

  if (isLoading && !data) return <Loading label="Loading appointments…" />;
  if (error) return <ErrorMessage error={error} onRetry={reload} />;
  if (!data) return null;

  const appointments =
    filter === 'ALL' ? data.appointments : data.appointments.filter((a) => a.status === filter);

  return (
    <section>
      <div className="page-heading">
        <h1>All appointments</h1>
        <label className="inline-label">
          Status
          <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)}>
            <option value="ALL">All</option>
            <option value="BOOKED">Booked</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </label>
      </div>

      {appointments.length === 0 ? (
        <EmptyState title="No appointments match this filter." />
      ) : (
        <div className="card table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date and time</th>
                <th>Doctor</th>
                <th>Patient</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{formatDateTime(appointment.slot.startsAt)}</td>
                  <td>
                    {appointment.slot.doctor.name}
                    <div className="muted">{appointment.slot.doctor.specialty}</div>
                  </td>
                  <td>
                    {appointment.patient.name}
                    <div className="muted">{appointment.patient.email}</div>
                  </td>
                  <td>
                    <StatusBadge status={appointment.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="muted">
        Showing {appointments.length} of {data.appointments.length} appointments.
      </p>
    </section>
  );
}
