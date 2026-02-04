import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
import Users from './components/Users/Users';
import Login from './components/Auth/Login';
import './App.css';

// Component that handles the authenticated app
const AuthenticatedApp = () => {
  const [currentView, setCurrentView] = React.useState('dashboard');
  const { user } = useAuth();

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
      case 'users':
        return <Users />;
      default:
        return <Dashboard />;
    }
  };

  return (
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
  );
};

// Main App component that handles authentication state
const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando InsightDental...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show login
  if (!user) {
    return <Login />;
  }

  // If user is authenticated, show the main app
  return <AuthenticatedApp />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
