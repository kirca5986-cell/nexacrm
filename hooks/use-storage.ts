'use client';

import { useEffect, useState } from 'react';
import { subscribe } from '@/lib/storage';

export function useStorageSync<T>(reader: () => T): T {
  const [data, setData] = useState<T>(() => ([] as unknown as T));

  useEffect(() => {
    setData(reader());
    const unsub = subscribe(() => setData(reader()));
    return () => {
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return data;
}

export function useIsClient(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
