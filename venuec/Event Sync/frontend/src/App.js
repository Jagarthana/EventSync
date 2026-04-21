import './App.css';
import './chamodi/styles/allocation-theme.css';
import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { OfficerProfileProvider } from './chamodi/context/OfficerProfileContext';
import { setToken, getToken } from './chamodi/api/client';
import { authService } from './chamodi/api/services';
import Header from './chamodi/components/Header';
import Footer from './chamodi/components/Footer';
import Login from './chamodi/pages/Login';

import AllocationOfficerDashboard from './chamodi/pages/AllocationOfficerDashboard';
import IncomingRequests from './chamodi/pages/IncomingRequests';
import ConflictResolution from './chamodi/pages/ConflictResolution';
import ApprovedBookings from './chamodi/pages/ApprovedBookings';
import MasterCalendar from './chamodi/pages/MasterCalendar';
import VenueManagementOfficer from './chamodi/pages/VenueManagementOfficer';
import ResourceInventory from './chamodi/pages/ResourceInventory';
import PreEventPrep from './chamodi/pages/PreEventPrep';
import IssuesMaintenance from './chamodi/pages/IssuesMaintenance';
import OfficerProfile from './chamodi/pages/OfficerProfile';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const t = getToken();
      if (!t) {
        setAuthReady(true);
        return;
      }
      try {
        const { data } = await authService.me();
        setIsLoggedIn(true);
        setUserRole(data.role);
        setUserEmail(data.email || '');
      } catch {
        setToken(null);
      } finally {
        setAuthReady(true);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const syncEmail = async () => {
      if (!isLoggedIn || !getToken()) return;
      try {
        const { data } = await authService.me();
        setUserEmail(data.email || '');
      } catch {
        /* ignore */
      }
    };
    window.addEventListener('allocation-profile-updated', syncEmail);
    return () => window.removeEventListener('allocation-profile-updated', syncEmail);
  }, [isLoggedIn]);

  const handleLogin = async (role, email) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setUserEmail(email);
    window.dispatchEvent(new Event('allocation-profile-updated'));
  };

  const handleLogout = () => {
    setToken(null);
    setIsLoggedIn(false);
    setUserRole(null);
    setUserEmail('');
  };

  if (!authReady) {
    return (
      <div className="app" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6b7280' }}>Loading…</p>
      </div>
    );
  }

  return (
    <OfficerProfileProvider userEmail={userEmail}>
      <div className="app">
        <Header
          isLoggedIn={isLoggedIn}
          userRole={userRole}
          onLogout={handleLogout}
          userEmail={userEmail}
        />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />

          <Route path="/allocation-dashboard" element={
            isLoggedIn && userRole === 'allocation' ? <AllocationOfficerDashboard /> : <Navigate to="/login" />
          } />
          <Route path="/allocation-profile" element={
            isLoggedIn && userRole === 'allocation' ? <OfficerProfile /> : <Navigate to="/login" />
          } />
          <Route path="/allocation-requests" element={
            isLoggedIn && userRole === 'allocation' ? <IncomingRequests /> : <Navigate to="/login" />
          } />
          <Route path="/allocation-conflicts" element={
            isLoggedIn && userRole === 'allocation' ? <ConflictResolution /> : <Navigate to="/login" />
          } />
          <Route path="/allocation-approved" element={
            isLoggedIn && userRole === 'allocation' ? <ApprovedBookings /> : <Navigate to="/login" />
          } />
          <Route path="/allocation-calendar" element={
            isLoggedIn && userRole === 'allocation' ? <MasterCalendar /> : <Navigate to="/login" />
          } />
          <Route path="/allocation-venues" element={
            isLoggedIn && userRole === 'allocation' ? <VenueManagementOfficer /> : <Navigate to="/login" />
          } />
          <Route path="/allocation-resources" element={
            isLoggedIn && userRole === 'allocation' ? <ResourceInventory /> : <Navigate to="/login" />
          } />
          <Route path="/allocation-pre-event" element={
            isLoggedIn && userRole === 'allocation' ? <PreEventPrep /> : <Navigate to="/login" />
          } />
          <Route path="/allocation-issues" element={
            isLoggedIn && userRole === 'allocation' ? <IssuesMaintenance /> : <Navigate to="/login" />
          } />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
        <Footer />
      </div>
    </OfficerProfileProvider>
  );
}

export default App;
