import { Link } from 'react-router';
import { fetchDoctors } from '../api/doctors';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loading } from '../components/Loading';
import { useApiData } from '../hooks';

export function DoctorsPage() {
  const { data, error, isLoading, reload } = useApiData(fetchDoctors);

  return (
    <section>
      <h1>Doctors</h1>
      <p className="muted">Choose a doctor to see their available times.</p>

      {isLoading && <Loading label="Loading doctors…" />}
      {error && <ErrorMessage error={error} onRetry={reload} />}
      {data && data.doctors.length === 0 && <EmptyState title="No doctors are listed yet." />}

      {data && data.doctors.length > 0 && (
        <ul className="grid">
          {data.doctors.map((doctor) => (
            <li key={doctor.id} className="card doctor-card">
              <h2>{doctor.name}</h2>
              <p className="muted">{doctor.specialty}</p>
              <Link to={`/doctors/${doctor.id}`} className="button">
                See available times
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
