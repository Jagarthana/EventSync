import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import { Topbar } from './components/Topbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Help } from './pages/Help';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Events } from './pages/Events';
import { GovernanceDashboard } from './pages/GovernanceDashboard';

import { FinanceDashboard } from './pages/FinanceDashboard';
import { VenueDashboard } from './pages/VenueDashboard';

function AppLayout({ children }) {
  return (
    <>
      <Topbar />
      {children}
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Routes with standard Topbar layout */}
          <Route path="/" element={<AppLayout><Home /></AppLayout>} />
          <Route path="/about" element={<AppLayout><About /></AppLayout>} />
          <Route path="/help" element={<AppLayout><Help /></AppLayout>} />
          <Route path="/login" element={<AppLayout><Login /></AppLayout>} />
          <Route path="/register" element={<AppLayout><Register /></AppLayout>} />
          <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/events" element={<AppLayout><Events /></AppLayout>} />

          {/* Standalone Governance Dashboard without main Topbar/Footer */}
          <Route path="/dashboard-governance" element={<GovernanceDashboard />} />
          <Route path="/dashboard-finance" element={<FinanceDashboard />} />
          <Route path="/dashboard-venue" element={<VenueDashboard />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
