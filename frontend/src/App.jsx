import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" />
        </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
