import { AuthProvider } from "./context/AuthContext";
import { AuditProvider } from "./context/AuditContext";
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <AuditProvider><AuthProvider><App /></AuthProvider></AuditProvider>
    </HelmetProvider>
  </React.StrictMode>,
)
