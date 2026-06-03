import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1c1c28',
              color: '#f5f5f5',
              border: '1px solid #32324e',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#e35d12', secondary: '#0a0a0f' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);