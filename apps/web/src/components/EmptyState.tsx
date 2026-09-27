import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  children?: ReactNode;
}

export function EmptyState({ title, children }: EmptyStateProps) {
  return (
    <div className="state empty">
      <p className="empty-title">{title}</p>
      {children}
    </div>
  );
}
