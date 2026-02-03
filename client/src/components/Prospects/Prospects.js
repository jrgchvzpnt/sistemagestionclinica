import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../Common.css';
import './Prospects.css';

const Prospects = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalProspects: 10,
    newProspects: 2,
    converted: 3,
    conversionRate: 30
  });
  const [prospects, setProspects] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    source: 'all',
    status: 'all'
  });

  useEffect(() => {
    fetchProspects();
    fetchStats();
  }, [filters]);

  const fetchProspects = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.source !== 'all') queryParams.append('source', filters.source);
      if (filters.status !== 'all') queryParams.append('status', filters.status);

      const response = await fetch(`/api/prospects?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setProspects(data.prospects || []);
    } catch (error) {
      console.error('Error fetching prospects:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/prospects/stats/dashboard', {
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

  // Mock prospects data based on the image
  const mockProspects = [
    {
      _id: '1',
      firstName: 'Lisette',
      lastName: 'Jerde',
      email: 'elsa.bartoletti57@gmail.com',
      phone: '493.269.9326 x6',
      source: 'Social',
      serviceInterest: 'Cardiology',
      assignedTo: { firstName: 'Winifred', lastName: 'Robb' },
      status: 'contacted',
      createdAt: '2025-09-11T00:00:00Z'
    },
    {
      _id: '2',
      firstName: 'Darrick',
      lastName: 'Braun',
      email: 'karson.wiegand2@yahoo.com',
      phone: '255.512.5049 x0',
      source: 'Advertisement',
      serviceInterest: 'Orthopedics',
      assignedTo: { firstName: 'Charles', lastName: 'Harris' },
      status: 'lost',
      createdAt: '2025-09-11T00:00:00Z'
    },
    {
      _id: '3',
      firstName: 'Santa',
      lastName: 'Lowe',
      email: 'cruz.walsh7@yahoo.com',
      phone: '446-786-8064 x9',
      source: 'Walk-in',
      serviceInterest: 'Orthopedics',
      assignedTo: { firstName: 'Myrtle', lastName: 'Wolff' },
      status: 'new',
      createdAt: '2025-09-11T00:00:00Z'
    },
    {
      _id: '4',
      firstName: 'Kiarra',
      lastName: 'Stroman',
      email: 'kobe33@gmail.com',
      phone: '1-363-515-0439',
      source: 'Advertisement',
      serviceInterest: 'Pediatrics',
      assignedTo: { firstName: 'Mr. Greg', lastName: 'Kassulke' },
      status: 'converted',
      createdAt: '2025-09-11T00:00:00Z'
    },
    {
      _id: '5',
      firstName: 'Wilmer',
      lastName: 'Denesik',
      email: '',
      phone: '797.891.2264 x6',
      source: 'Social',
      serviceInterest: 'Orthopedics',
      assignedTo: { firstName: 'Cathy', lastName: 'Cremin' },
      status: 'converted',
      createdAt: '2025-09-11T00:00:00Z'
    },
    {
      _id: '6',
      firstName: 'Arely',
      lastName: 'Schultz',
      email: 'vidal.mills@yahoo.com',
      phone: '1-712-441-5093',
      source: 'Social',
      serviceInterest: 'Cardiology',
      assignedTo: { firstName: 'Franklin', lastName: 'Sanford' },
      status: 'new',
      createdAt: '2025-09-11T00:00:00Z'
    },
    {
      _id: '7',
      firstName: 'Payton',
      lastName: 'Medhurst-Luettgen',
      email: 'nasir.huel@gmail.com',
      phone: '956-635-8498 x0',
      source: 'Advertisement',
      serviceInterest: 'Pediatrics',
      assignedTo: { firstName: 'Jill', lastName: 'Cummerata' },
      status: 'lost',
      createdAt: '2025-09-11T00:00:00Z'
    },
    {
      _id: '8',
      firstName: 'Roxane',
      lastName: 'Reilly',
      email: 'ezra_denesik33@gmail.com',
      phone: '1-296-379-1236',
      source: 'Walk-in',
      serviceInterest: 'Lab tests',
      assignedTo: { firstName: 'Laverne', lastName: 'Barrows' },
      status: 'contacted',
      createdAt: '2025-09-11T00:00:00Z'
    },
    {
      _id: '9',
      firstName: 'Adolf',
      lastName: 'Purdy',
      email: 'hannah_bechtelar@yahoo.com',
      phone: '710.697.0598 x2',
      source: 'Referral',
      serviceInterest: 'General consultation',
      assignedTo: { firstName: 'Grady', lastName: 'Kiehn' },
      status: 'converted',
      createdAt: '2025-09-11T00:00:00Z'
    },
    {
      _id: '10',
      firstName: 'Della',
      lastName: 'Langosh',
      email: 'willis_mcdermott@gmail.com',
      phone: '530.728.1219',
      source: 'Advertisement',
      serviceInterest: 'Pediatrics',
      assignedTo: { firstName: 'Christine', lastName: 'Gislason V' },
      status: 'lost',
      createdAt: '2025-09-11T00:00:00Z'
    }
  ];

  const getStatusBadge = (status) => {
    const statusMap = {
      new: { text: 'Nuevo', class: 'status-new', icon: '🆕' },
      contacted: { text: 'Contactado', class: 'status-contacted', icon: '📞' },
      converted: { text: 'Convertido', class: 'status-converted', icon: '✅' },
      lost: { text: 'Perdido', class: 'status-lost', icon: '❌' }
    };
    
    const statusInfo = statusMap[status] || { text: status, class: 'status-default', icon: '📋' };
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.icon} {statusInfo.text}
      </span>
    );
  };

  const getSourceIcon = (source) => {
    const sourceMap = {
      'Social': '📱',
      'Advertisement': '📢',
      'Walk-in': '🚶',
      'Referral': '👥'
    };
    return sourceMap[source] || '📋';
  };

  return (
    <div className="prospects">
      <div className="page-header">
        <div className="header-content">
          <h1>{t('prospects.title')}</h1>
          <p>{t('prospects.subtitle')}</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">{t('prospects.update')}</button>
          <button className="btn-primary">{t('prospects.addProspect')}</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalProspects}</h3>
            <p>{t('prospects.totalProspects')}</p>
            <span className="stat-note">{t('prospects.allPotentialPatients')}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🆕</div>
          <div className="stat-content">
            <h3>{stats.newProspects}</h3>
            <p>{t('prospects.newProspects')}</p>
            <span className="stat-note">{t('prospects.awaitingContact')}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.converted}</h3>
            <p>{t('prospects.converted')}</p>
            <span className="stat-note">{t('prospects.becamePatients')}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>{stats.conversionRate}%</h3>
            <p>{t('prospects.conversionRate')}</p>
            <span className="stat-note">{t('prospects.successRate')}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder={t('prospects.searchPlaceholder')}
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>
        <div className="filter-dropdowns">
          <select 
            value={filters.source} 
            onChange={(e) => setFilters({...filters, source: e.target.value})}
          >
            <option value="all">{t('prospects.allSources')}</option>
            <option value="social">{t('prospects.social')}</option>
            <option value="advertisement">{t('prospects.advertisement')}</option>
            <option value="walk-in">{t('prospects.walkIn')}</option>
            <option value="referral">{t('prospects.referral')}</option>
          </select>
          
          <select 
            value={filters.status} 
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">{t('prospects.allStatuses')}</option>
            <option value="new">{t('prospects.new')}</option>
            <option value="contacted">{t('prospects.contacted')}</option>
            <option value="converted">{t('prospects.converted')}</option>
            <option value="lost">{t('prospects.lost')}</option>
          </select>
        </div>
      </div>

      {/* Prospects Management Table */}
      <div className="prospects-section">
        <div className="section-header">
          <h2>{t('prospects.managementTitle')}</h2>
          <p>{t('prospects.managementSubtitle')}</p>
        </div>

        <div className="prospects-table">
          <div className="table-header">
            <div className="col-prospect">{t('prospects.prospectDetails')}</div>
            <div className="col-contact">{t('prospects.contactInfo')}</div>
            <div className="col-source">{t('prospects.source')}</div>
            <div className="col-interest">{t('prospects.serviceInterest')}</div>
            <div className="col-assigned">{t('prospects.assignedTo')}</div>
            <div className="col-status">{t('prospects.status')}</div>
            <div className="col-created">{t('prospects.created')}</div>
            <div className="col-actions">{t('prospects.actions')}</div>
          </div>

          <div className="table-body">
            {(prospects.length > 0 ? prospects : mockProspects).map((prospect) => (
              <div key={prospect._id} className="table-row">
                <div className="col-prospect">
                  <div className="prospect-info">
                    <div className="prospect-avatar">
                      {prospect.firstName.charAt(0)}{prospect.lastName.charAt(0)}
                    </div>
                    <div>
                      <h4>{prospect.firstName} {prospect.lastName}</h4>
                      <p>{t('prospects.prospectId')}: #{prospect._id.slice(-4)}</p>
                    </div>
                  </div>
                </div>

                <div className="col-contact">
                  <div className="contact-info">
                    {prospect.email && (
                      <p>📧 {prospect.email}</p>
                    )}
                    <p>📞 {prospect.phone}</p>
                  </div>
                </div>

                <div className="col-source">
                  <div className="source-info">
                    <span className="source-icon">{getSourceIcon(prospect.source)}</span>
                    <span>{prospect.source}</span>
                  </div>
                </div>

                <div className="col-interest">
                  <span className="interest-badge">{prospect.serviceInterest}</span>
                </div>

                <div className="col-assigned">
                  <div className="assigned-info">
                    <div className="assigned-avatar">
                      {prospect.assignedTo.firstName.charAt(0)}{prospect.assignedTo.lastName.charAt(0)}
                    </div>
                    <div>
                      <p>{prospect.assignedTo.firstName} {prospect.assignedTo.lastName}</p>
                    </div>
                  </div>
                </div>

                <div className="col-status">
                  {getStatusBadge(prospect.status)}
                </div>

                <div className="col-created">
                  <p>{new Date(prospect.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="col-actions">
                  <div className="action-buttons">
                    <button className="btn-action">{t('prospects.actions')}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prospects;
