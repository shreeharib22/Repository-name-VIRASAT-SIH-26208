import type { ReactNode } from 'react';

export function Portal({ children }: { children: ReactNode }) {
  return <div className="portal">{children}</div>;
}
