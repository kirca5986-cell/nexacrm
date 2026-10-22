'use client';

import { useEffect } from 'react';
import { ensureSeed } from '@/lib/storage';

export function ClientInit({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    ensureSeed();
  }, []);
  return <>{children}</>;
}
