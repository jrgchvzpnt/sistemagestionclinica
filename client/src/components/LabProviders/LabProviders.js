import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './LabProviders.css';

const LabProviders = () => {
  const { t } = useTranslation();
  const [providers, setProviders] = useState([]);
  const [stats, setStats] = useState({
    totalProviders: 10,
    activeProviders: 7,
    pendingProviders: 2,
    totalTests: 101608
  });
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    specialty: 'all'
  });

  useEffect(() => {
    fetchProviders();
    fetchStats();
  }, [filters]);

  const fetchProviders = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.specialty !== 'all') queryParams.append('specialty', filters.specialty);

      const response = await fetch(`/api/lab-providers?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setProviders(data.providers || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/lab-providers/stats/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { text: 'Activo', class: 'status-active' },
      inactive: { text: 'Inactivo', class: 'status-inactive' },
      pending: { text: 'Pendiente', class: 'status-pending' },
      budget: { text: 'Budget', class: 'status-budget' },
      premium: { text: 'Premium', class: 'status-premium' },
      moderate: { text: 'Moderate', class: 'status-moderate' }
    };
    
    const statusInfo = statusMap[status] || { text: status, class: 'status-default' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const mockProviders = [
    {
      _id: '1',
      name: 'Zentiak, Mills and Feet Labs',
      code: 'LAB001',
      contactPerson: 'Casey Tillman',
      email: 'casey.tillman@zentiak.com',
      phone: '662.615.1186',
      specialties: ['Chemistry', 'Pathology'],
      performance: { totalTests: 1834 },
      rating: 4.1,
      status: 'pending',
      lastTest: 'Feb 3, 2024'
    },
    {
      _id: '2',
      name: 'Von, Flatley and Bauch Labs',
      code: 'LAB002',
      contactPerson: 'Jonathan Champion II',
      email: 'champion@vonlab.com',
      phone: '564.260.1186',
      specialties: ['Molecular'],
      performance: { totalTests: 746 },
      rating: 4.2,
      status: 'inactive',
      lastTest: 'Feb 27, 2024'
    },
    {
      _id: '3',
      name: 'Kilback - Kerluke Labs',
      code: 'LAB003',
      contactPerson: 'Tonya Godinez',
      email: 'tonya.godinez@kilback.com',
      phone: '(878) 848-8775',
      specialties: ['Molecular'],
      performance: { totalTests: 1169 },
      rating: 3.4,
      status: 'active',
      lastTest: 'Aug 23, 2025'
    }
  ];

  return (
    <div className="lab-providers">
      <div className="page-header">
        <div className="header-content">
          <h1>{t('labProviders.title')}</h1>
          <p>{t('labProviders.subtitle')}</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">{t('labProviders.update')}</button>
          <button className="btn-primary">{t('labProviders.addProvider')}</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.totalProviders}</h3>
            <p>{t('labProviders.totalProviders')}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.activeProviders}</h3>
            <p>{t('labProviders.activeProviders')}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>{stats.pendingProviders}</h3>
            <p>{t('labProviders.pendingProviders')}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🧪</div>
          <div className="stat-content">
            <h3>{stats.totalTests?.toLocaleString() || '101,608'}</h3>
            <p>{t('labProviders.totalTests')}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder={t('labProviders.searchPlaceholder')}
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>
        <div className="filter-dropdowns">
          <select 
            value={filters.status} 
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">{t('labProviders.allStatuses')}</option>
            <option value="active">{t('labProviders.active')}</option>
            <option value="inactive">{t('labProviders.inactive')}</option>
            <option value="pending">{t('labProviders.pending')}</option>
          </select>
          
          <select 
            value={filters.specialty} 
            onChange={(e) => setFilters({...filters, specialty: e.target.value})}
          >
            <option value="all">{t('labProviders.allSpecialties')}</option>
            <option value="chemistry">{t('labProviders.chemistry')}</option>
            <option value="pathology">{t('labProviders.pathology')}</option>
            <option value="molecular">{t('labProviders.molecular')}</option>
          </select>
        </div>
      </div>

      {/* Providers Table */}
      <div className="providers-section">
        <div className="section-header">
          <h2>{t('labProviders.providersTitle')}</h2>
          <p>{t('labProviders.providersSubtitle')}</p>
        </div>

        <div className="providers-table">
          <div className="table-header">
            <div className="col-provider">{t('labProviders.providerDetails')}</div>
            <div className="col-contact">{t('labProviders.contactInfo')}</div>
            <div className="col-specialties">{t('labProviders.specialties')}</div>
            <div className="col-performance">{t('labProviders.performance')}</div>
            <div className="col-contract">{t('labProviders.contract')}</div>
            <div className="col-status">{t('labProviders.status')}</div>
            <div className="col-actions">{t('labProviders.actions')}</div>
          </div>

          <div className="table-body">
            {(providers.length > 0 ? providers : mockProviders).map((provider) => (
              <div key={provider._id} className="table-row">
                <div className="col-provider">
                  <div className="provider-info">
                    <h4>{provider.name}</h4>
                    <p>{provider.code}</p>
                    <div className="rating">
                      {'★'.repeat(Math.floor(provider.rating))}
                      {'☆'.repeat(5 - Math.floor(provider.rating))}
                      <span>({provider.rating})</span>
                    </div>
                  </div>
                </div>

                <div className="col-contact">
                  <div className="contact-info">
                    <p>👤 {provider.contactPerson}</p>
                    <p>📧 {provider.email}</p>
                    <p>📞 {provider.phone}</p>
                  </div>
                </div>

                <div className="col-specialties">
                  <div className="specialties">
                    {provider.specialties?.map((specialty, index) => (
                      <span key={index} className="specialty-tag">{specialty}</span>
                    ))}
                  </div>
                </div>

                <div className="col-performance">
                  <div className="performance-info">
                    <p>{provider.performance?.totalTests || 0} {t('labProviders.tests')}</p>
                    <p>⏱️ 48 hours</p>
                    <div className="performance-bar">
                      <div className="performance-fill" style={{width: '85%'}}></div>
                    </div>
                  </div>
                </div>

                <div className="col-contract">
                  <div className="contract-info">
                    <p>{provider.lastTest}</p>
                    <p>📄 Apr 15, 2026</p>
                  </div>
                </div>

                <div className="col-status">
                  {getStatusBadge(provider.status)}
                </div>

                <div className="col-actions">
                  <button className="btn-action">{t('labProviders.actions')}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabProviders;
