'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      closeButton
      theme="dark"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--fg)',
        },
      }}
    />
  );
}

export { toast } from 'sonner';
