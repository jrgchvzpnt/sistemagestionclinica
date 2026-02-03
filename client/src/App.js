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
        return (
          <div className="page-container">
            <div className="page-header">
              <div className="header-content">
                <span className="header-icon">👥</span>
                <div>
                  <h1>Pacientes</h1>
                  <p>Gestionar información de pacientes y historiales médicos</p>
                </div>
              </div>
            </div>
            <div className="coming-soon">
              <h2>Próximamente</h2>
              <p>Esta funcionalidad estará disponible pronto.</p>
            </div>
          </div>
        );
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
