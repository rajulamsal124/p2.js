import { Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

interface RouteConfig {
  path: string;
  component: () => Promise<{ default: React.ComponentType }>;
  loadingFallback?: React.ReactNode;
}

interface P2AppProps {
  routes: RouteConfig[];
  initialData?: any;
  errorFallback?: (props: FallbackProps) => React.ReactNode;
  loadingFallback?: React.ReactNode;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

export function P2App({ 
  routes, 
  errorFallback,
  loadingFallback = <div>Loading...</div>
}: P2AppProps) {
  if (!errorFallback) {
    return (
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={loadingFallback}>
            <BrowserRouter>
              <Routes>
                {routes.map((route) => {
                  const Component = lazy(route.component);
                  return (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={
                        <Suspense fallback={route.loadingFallback || loadingFallback}>
                          <Component />
                        </Suspense>
                      }
                    />
                  );
                })}
              </Routes>
            </BrowserRouter>
          </Suspense>
        </QueryClientProvider>
      </HelmetProvider>
    );
  }

  return (
    <ErrorBoundary fallbackRender={errorFallback}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={loadingFallback}>
            <BrowserRouter>
              <Routes>
                {routes.map((route) => {
                  const Component = lazy(route.component);
                  return (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={
                        <Suspense fallback={route.loadingFallback || loadingFallback}>
                          <Component />
                        </Suspense>
                      }
                    />
                  );
                })}
              </Routes>
            </BrowserRouter>
          </Suspense>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
