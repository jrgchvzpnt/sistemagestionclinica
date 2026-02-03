import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './Dashboard.css';

const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 10,
    monthlyRevenue: 0,
    lowStockItems: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>{t('dashboard.title')}</h1>
        <p>{t('dashboard.subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.todayAppointments}</h3>
            <p>{t('dashboard.todayAppointments')}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalPatients}</h3>
            <p>{t('dashboard.totalPatients')}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>${stats.monthlyRevenue}</h3>
            <p>{t('dashboard.monthlyRevenue')}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{stats.lowStockItems}</h3>
            <p>{t('dashboard.lowStockItems')}</p>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>{t('dashboard.revenueChart')}</h2>
          <button className="btn-secondary">{t('dashboard.viewDetails')}</button>
        </div>
        <div className="chart-container">
          <div className="chart-placeholder">
            <p>{t('dashboard.chartPlaceholder')}</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>{t('dashboard.recentAppointments')}</h2>
            <button className="btn-link">{t('dashboard.viewAll')}</button>
          </div>
          <div className="appointments-list">
            {recentAppointments.length > 0 ? (
              recentAppointments.map((appointment, index) => (
                <div key={index} className="appointment-item">
                  <div className="appointment-info">
                    <h4>{appointment.patient?.firstName} {appointment.patient?.lastName}</h4>
                    <p>{appointment.type}</p>
                  </div>
                  <div className="appointment-time">
                    <span>{new Date(appointment.appointmentDate).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">{t('dashboard.noAppointments')}</p>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>{t('dashboard.recentLeads')}</h2>
            <button className="btn-link">{t('dashboard.viewAll')}</button>
          </div>
          <div className="leads-list">
            {recentLeads.length > 0 ? (
              recentLeads.map((lead, index) => (
                <div key={index} className="lead-item">
                  <div className="lead-info">
                    <h4>{lead.firstName} {lead.lastName}</h4>
                    <p>{lead.serviceInterest}</p>
                  </div>
                  <div className="lead-status">
                    <span className={`status ${lead.status}`}>{lead.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">{t('dashboard.noLeads')}</p>
            )}
          </div>
        </div>
      </div>

      {/* API Connection Test */}
      <div className="dashboard-section">
        <div className="api-status">
          <div className="status-indicator connected">
            <span className="status-dot"></span>
            <span>{t('dashboard.apiConnected')}</span>
          </div>
          <div className="status-details">
            <p>{t('dashboard.lastUpdate')}: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
