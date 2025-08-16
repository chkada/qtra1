import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import PageTransition from '@/components/Layout/PageTransition';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <PageTransition>
        <Component {...pageProps} />
      </PageTransition>
    </AuthProvider>
  );
}
