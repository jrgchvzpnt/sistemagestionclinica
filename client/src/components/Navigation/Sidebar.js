import React from 'react';
import { useTranslation } from 'react-i18next';
import './Sidebar.css';

const Sidebar = ({ currentView, onViewChange, user }) => {
  const { t } = useTranslation();

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
          <span className="logo-icon">🏥</span>
          <div className="clinic-info">
            <h3>Heavycoders</h3>
            <p>clinic</p>
          </div>
        </div>
        
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0) || 'QB'}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name || 'Queen Bayer'}</span>
            <span className="user-role">{user?.role || 'Admin'}</span>
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
          {menuItems.slice(1, 3).map((item) => (
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
          <h4 className="nav-section-title">ANÁLISIS CON IA</h4>
          {menuItems[3].submenu.map((item) => (
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
          
          <button
            className={`nav-item ${currentView === 'odontogram' ? 'active' : ''}`}
            onClick={() => handleMenuClick('odontogram')}
          >
            <span className="nav-icon">🦷</span>
            <span className="nav-label">{t('nav.odontogram')}</span>
            <span className="dental-badge">Dental</span>
          </button>
        </div>

        <div className="nav-section">
          <h4 className="nav-section-title">GESTIÓN FINANCIERA</h4>
          {menuItems.slice(5, 8).map((item) => (
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
          <h4 className="nav-section-title">OPERACIONES</h4>
          {menuItems.slice(8).map((item) => (
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
      </nav>

      <div className="sidebar-footer">
        <div className="language-selector">
          <span className="language-icon">🌐</span>
          <span>Español</span>
          <span className="currency">$ USD</span>
        </div>
        
        <button className="settings-btn">
          <span className="settings-icon">⚙️</span>
          <span>{t('nav.settings')}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
