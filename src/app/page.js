'use client';
import SvoiApp from '@/components/SvoiApp';
import AppProviders from '@/components/providers/AppProviders';

export default function Home() {
  return (
    <AppProviders>
      <SvoiApp />
    </AppProviders>
  );
}
