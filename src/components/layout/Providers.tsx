// src/components/layout/Providers.tsx
'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { SWRConfig } from 'swr';

export function Providers({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());

  return (
    <SWRConfig
      value={{
        fetcher: (url: string) => fetch(url).then((res) => res.json()),
        revalidateOnFocus: false,
      }}
    >
      {children}
    </SWRConfig>
  );
}
