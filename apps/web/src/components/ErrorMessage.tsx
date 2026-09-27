interface ErrorMessageProps {
  error: Error;
  onRetry?: () => void;
}

export function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  return (
    <div className="alert alert-error" role="alert">
      <span>{error.message}</span>
      {onRetry && (
        <button type="button" className="button button-small" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
