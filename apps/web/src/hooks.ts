import { useCallback, useEffect, useState } from 'react';

interface ApiData<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  reload: () => void;
}

// Loads data when the component appears (and again when `load` changes).
// `load` must be stable: define it outside the component or wrap it in useCallback.
export function useApiData<T>(load: () => Promise<T>): ApiData<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    // Ignore the response if the component has moved on (e.g. navigated away).
    let ignore = false;

    load()
      .then((result) => {
        if (!ignore) {
          setData(result);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (!ignore) setError(err);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [load, reloadCount]);

  const reload = useCallback(() => {
    setIsLoading(true);
    setReloadCount((count) => count + 1);
  }, []);

  return { data, error, isLoading, reload };
}
