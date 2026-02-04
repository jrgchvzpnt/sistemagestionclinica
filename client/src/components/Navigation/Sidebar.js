import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Sidebar.css';

const Sidebar = ({ currentView, onViewChange, user }) => {
  const { t } = useTranslation();
  const [showSettings, setShowSettings] = useState(false);

  // Definir roles y permisos
  const userRoles = {
    'Director Médico': {
      permissions: ['dashboard', 'patients', 'appointments', 'ai-analysis', 'xray-analysis', 'test-reports-analysis', 'odontogram', 'prospects', 'prescriptions', 'billing', 'lab-providers', 'users'],
      isAdmin: true
    },
    'Doctor': {
      permissions: ['dashboard', 'patients', 'appointments', 'ai-analysis', 'xray-analysis', 'test-reports-analysis', 'odontogram', 'prescriptions'],
      isAdmin: false
    },
    'Enfermera': {
      permissions: ['dashboard', 'patients', 'appointments', 'prescriptions'],
      isAdmin: false
    },
    'Recepcionista': {
      permissions: ['dashboard', 'patients', 'appointments', 'prospects', 'billing'],
      isAdmin: false
    },
    'Técnico de Laboratorio': {
      permissions: ['dashboard', 'ai-analysis', 'xray-analysis', 'test-reports-analysis', 'lab-providers'],
      isAdmin: false
    },
    'Operador': {
      permissions: ['dashboard', 'patients', 'appointments'],
      isAdmin: false
    }
  };

  // Obtener permisos del usuario actual
  const currentUserRole = userRoles[user?.role] || userRoles['Operador'];
  const hasPermission = (permission) => currentUserRole.permissions.includes(permission);

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
  };

  const handleLanguageChange = () => {
    // TODO: Implement language switching functionality
    alert('Funcionalidad de cambio de idioma próximamente');
  };

  const handleLogout = () => {
    if (window.confirm('¿Está seguro de que desea cerrar sesión?')) {
      // TODO: Implement logout functionality
      localStorage.removeItem('token');
      alert('Sesión cerrada');
      // Redirect to login page
    }
  };

  const handleProfileSettings = () => {
    // TODO: Implement profile settings modal
    alert('Configuración de perfil próximamente');
  };

  const handleSystemSettings = () => {
    // TODO: Implement system settings
    alert('Configuración del sistema próximamente');
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: t('nav.dashboard'),
      icon: '📊',
      view: 'dashboard'
    },
    {
      id: 'patients',
      label: t('nav.patients'),
      icon: '👥',
      view: 'patients'
    },
    {
      id: 'appointments',
      label: t('nav.appointments'),
      icon: '📅',
      view: 'appointments'
    },
    {
      id: 'ai-analysis',
      label: t('nav.ai_analysis'),
      icon: '🤖',
      submenu: [
        {
          id: 'xray-analysis',
          label: t('nav.xray_analysis'),
          icon: '🦷',
          view: 'xray-analysis'
        },
        {
          id: 'lab-reports',
          label: t('nav.lab_reports'),
          icon: '🧪',
          view: 'test-reports-analysis'
        }
      ]
    },
    {
      id: 'odontogram',
      label: t('nav.odontogram'),
      icon: '🦷',
      view: 'odontogram'
    },
    {
      id: 'prospects',
      label: t('nav.prospects'),
      icon: '🎯',
      view: 'prospects'
    },
    {
      id: 'prescriptions',
      label: t('nav.prescriptions'),
      icon: '💊',
      view: 'prescriptions'
    },
    {
      id: 'billing',
      label: t('nav.billing'),
      icon: '💰',
      view: 'billing'
    },
    {
      id: 'lab-providers',
      label: t('nav.lab_providers'),
      icon: '🏥',
      view: 'lab-providers'
    }
  ];

  const handleMenuClick = (view) => {
    onViewChange(view);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="clinic-logo">
          <span className="logo-icon">🦷</span>
          <div className="clinic-info">
            <h3>InsightDental</h3>
            <p>Diagnósticos precisos, administración inteligente.</p>
          </div>
        </div>
        
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0) || 'DM'}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name || 'Dr. María González'}</span>
            <span className="user-role">{user?.role || 'Director Médico'}</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <h4 className="nav-section-title">RESUMEN</h4>
          {menuItems.slice(0, 1).map((item) => (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.view ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.view)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="nav-section">
          <h4 className="nav-section-title">GESTIÓN DE PACIENTES</h4>
          {menuItems.slice(1, 3).filter(item => hasPermission(item.view)).map((item) => (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.view ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.view)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>

        {hasPermission('ai-analysis') && (
          <div className="nav-section">
            <h4 className="nav-section-title">ANÁLISIS CON IA</h4>
            {menuItems[3].submenu.filter(item => hasPermission(item.view)).map((item) => (
              <button
                key={item.id}
                className={`nav-item ${currentView === item.view ? 'active' : ''}`}
                onClick={() => handleMenuClick(item.view)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                <span className="ai-badge">AI</span>
              </button>
            ))}
          </div>
        )}

        {hasPermission('odontogram') && (
          <div className="nav-section">
            <h4 className="nav-section-title">ANÁLISIS DENTAL</h4>
            <button
              className={`nav-item ${currentView === 'odontogram' ? 'active' : ''}`}
              onClick={() => handleMenuClick('odontogram')}
            >
              <span className="nav-icon">🦷</span>
              <span className="nav-label">{t('nav.odontogram')}</span>
              <span className="dental-badge">Dental</span>
            </button>
          </div>
        )}

        {(hasPermission('prospects') || hasPermission('prescriptions') || hasPermission('billing')) && (
          <div className="nav-section">
            <h4 className="nav-section-title">GESTIÓN FINANCIERA</h4>
            {menuItems.slice(5, 8).filter(item => hasPermission(item.view)).map((item) => (
              <button
                key={item.id}
                className={`nav-item ${currentView === item.view ? 'active' : ''}`}
                onClick={() => handleMenuClick(item.view)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {hasPermission('lab-providers') && (
          <div className="nav-section">
            <h4 className="nav-section-title">OPERACIONES</h4>
            {menuItems.slice(8).filter(item => hasPermission(item.view)).map((item) => (
              <button
                key={item.id}
                className={`nav-item ${currentView === item.view ? 'active' : ''}`}
                onClick={() => handleMenuClick(item.view)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {currentUserRole.isAdmin && (
          <div className="nav-section">
            <h4 className="nav-section-title">ADMINISTRACIÓN</h4>
            <button
              className={`nav-item ${currentView === 'users' ? 'active' : ''}`}
              onClick={() => handleMenuClick('users')}
            >
              <span className="nav-icon">👥</span>
              <span className="nav-label">Gestión de Usuarios</span>
              <span className="ai-badge">Admin</span>
            </button>
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="language-selector">
          <span className="language-icon">🌐</span>
          <span>Español</span>
          <span className="currency">$ USD</span>
        </div>
        
        <div className="settings-section">
          <button className="settings-btn" onClick={handleSettingsClick}>
            <span className="settings-icon">⚙️</span>
            <span>{t('nav.settings')}</span>
            <span className={`settings-arrow ${showSettings ? 'open' : ''}`}>▼</span>
          </button>
          
          {showSettings && (
            <div className="settings-dropdown">
              <button className="settings-option" onClick={handleProfileSettings}>
                <span className="option-icon">👤</span>
                <span>Perfil de Usuario</span>
              </button>
              <button className="settings-option" onClick={handleSystemSettings}>
                <span className="option-icon">🔧</span>
                <span>Configuración del Sistema</span>
              </button>
              <button className="settings-option" onClick={handleLanguageChange}>
                <span className="option-icon">🌐</span>
                <span>Cambiar Idioma</span>
              </button>
              <div className="settings-divider"></div>
              <button className="settings-option logout" onClick={handleLogout}>
                <span className="option-icon">🚪</span>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
