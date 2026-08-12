import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { PublicPage } from './pages/PublicPage';
import { AdminPage } from './pages/AdminPage';
import { FAVICON_DATA_URI } from './assets/faviconDataUri';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);

    // Register Service Worker for PWA installation
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('PWA Service Worker registrado com sucesso:', reg.scope);
        })
        .catch((err) => console.error('Erro ao registrar Service Worker:', err));
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const cleanPath = currentPath.toLowerCase().trim();
  const isAdminView = cleanPath.startsWith('/admin') || cleanPath.startsWith('/admim');

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            {isAdminView ? (
              <AdminPage onBackToPublic={() => navigate('/')} />
            ) : (
              <PublicPage onNavigateAdmin={() => navigate('/admin')} />
            )}
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
