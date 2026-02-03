import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Sidebar from './components/Navigation/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import LabProviders from './components/LabProviders/LabProviders';
import XRayAnalysis from './components/AIAnalysis/XRayAnalysis';
import TestReportsAnalysis from './components/AIAnalysis/TestReportsAnalysis';
import Odontogram from './components/Odontogram/Odontogram';
import Appointments from './components/Appointments/Appointments';
import Prospects from './components/Prospects/Prospects';
import Prescriptions from './components/Prescriptions/Prescriptions';
import Patients from './components/Patients/Patients';
import Billing from './components/Billing/Billing';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [user] = useState({
    name: 'Queen Bayer',
    role: 'Admin'
  });

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'lab-providers':
        return <LabProviders />;
      case 'xray-analysis':
        return <XRayAnalysis />;
      case 'test-reports-analysis':
        return <TestReportsAnalysis />;
      case 'odontogram':
        return <Odontogram />;
      case 'appointments':
        return <Appointments />;
      case 'prospects':
        return <Prospects />;
      case 'prescriptions':
        return <Prescriptions />;
      case 'patients':
        return <Patients />;
      case 'billing':
        return <Billing />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AuthProvider>
      <div className="app">
        <Sidebar 
          currentView={currentView} 
          onViewChange={setCurrentView}
          user={user}
        />
        <main className="main-content">
          {renderCurrentView()}
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
