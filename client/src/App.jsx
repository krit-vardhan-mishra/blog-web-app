import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import { LenisProvider } from './context/LenisContext';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LenisProvider>
          <AppRoutes />
        </LenisProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;