import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { bookAppointment } from '../api/appointments';
import { ApiError } from '../api/client';
import { fetchDoctorSlots } from '../api/doctors';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loading } from '../components/Loading';
import { useApiData } from '../hooks';
import type { Slot } from '../types';
import { formatDateTime, formatTime, groupByDay } from '../utils/format';

export function BookAppointmentPage() {
  const { doctorId = '' } = useParams();
  const navigate = useNavigate();
  const loadSlots = useCallback(() => fetchDoctorSlots(doctorId), [doctorId]);
  const { data, error, isLoading, reload } = useApiData(loadSlots);

  const [selected, setSelected] = useState<Slot | null>(null);
  const [bookingError, setBookingError] = useState<Error | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  async function handleConfirm() {
    if (!selected) return;
    setBookingError(null);
    setIsBooking(true);
    try {
      await bookAppointment(selected.id);
      navigate('/appointments', { state: { message: 'Your appointment is booked.' } });
    } catch (err) {
      setBookingError(err as Error);
      setIsBooking(false);
      // Someone else got the slot first: refresh the list so it disappears.
      if (err instanceof ApiError && err.code === 'SLOT_ALREADY_BOOKED') {
        setSelected(null);
        reload();
      }
    }
  }

  if (isLoading && !data) return <Loading label="Loading available times…" />;
  if (error) return <ErrorMessage error={error} onRetry={reload} />;
  if (!data) return null;

  const { doctor, slots } = data;

  return (
    <section>
      <Link to="/doctors" className="back-link">
        ← All doctors
      </Link>
      <h1>{doctor.name}</h1>
      <p className="muted">{doctor.specialty}</p>

      {bookingError && <ErrorMessage error={bookingError} />}

      {slots.length === 0 ? (
        <EmptyState title="No available times for this doctor.">
          <Link to="/doctors">Try another doctor</Link>
        </EmptyState>
      ) : (
        <div className="slot-days">
          {groupByDay(slots, (slot) => slot.startsAt).map(([day, daySlots]) => (
            <div key={day} className="card">
              <h2 className="day-heading">{day}</h2>
              <div className="slots">
                {daySlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    className={`slot ${selected?.id === slot.id ? 'slot-selected' : ''}`}
                    aria-pressed={selected?.id === slot.id}
                    onClick={() => setSelected(slot)}
                  >
                    {formatTime(slot.startsAt)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="confirm-bar" role="region" aria-label="Confirm booking">
          <span>
            Book <strong>{formatDateTime(selected.startsAt)}</strong> with {doctor.name}?
          </span>
          <div className="actions">
            <button type="button" className="button button-ghost" onClick={() => setSelected(null)}>
              Change
            </button>
            <button type="button" className="button" onClick={handleConfirm} disabled={isBooking}>
              {isBooking ? 'Booking…' : 'Confirm booking'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
