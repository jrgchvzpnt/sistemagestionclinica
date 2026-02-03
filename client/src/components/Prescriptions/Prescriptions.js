import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../Common.css';
import './Prescriptions.css';

const Prescriptions = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalPrescriptions: 10,
    active: 0,
    pending: 0,
    dispensed: 5
  });
  const [prescriptions, setPrescriptions] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    doctor: 'all',
    timeRange: 'all'
  });

  useEffect(() => {
    fetchPrescriptions();
    fetchStats();
  }, [filters]);

  const fetchPrescriptions = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.doctor !== 'all') queryParams.append('doctor', filters.doctor);

      const response = await fetch(`/api/prescriptions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setPrescriptions(data.prescriptions || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/prescriptions/stats/dashboard', {
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

  // Mock prescriptions data based on the image
  const mockPrescriptions = [
    {
      _id: 'RX-ITT8EOSE',
      patient: { firstName: 'Ariane', lastName: 'McKenzie', age: 71 },
      doctor: { firstName: 'Deshawn', lastName: 'Barton' },
      diagnosis: 'Carie casi aptus totidem suscipit subvenio.',
      medications: [{ name: 'Paracetamol', dosage: '500mg' }],
      status: 'active',
      createdAt: '2025-09-11T00:00:00Z'
    },
    {
      _id: 'RX-MHPENTWV',
      patient: { firstName: 'Lessie', lastName: 'Abbott', age: 30 },
      doctor: { firstName: 'Henri', lastName: 'Schmitt' },
      diagnosis: 'Adipisci deporto sol trado tepide caries tandem appono et.',
      medications: [{ name: 'Amoxicillin', dosage: '50mg' }],
      status: 'completed',
      createdAt: '2025-09-11T00:00:00Z'
    },
    {
      _id: 'RX-UNIOCSLB',
      patient: { firstName: 'Brando', lastName: 'Sanford', age: 70 },
      doctor: { firstName: 'Pierce', lastName: "O'Conner" },
      diagnosis: 'Constans advento ager vitium eaque.',
      medications: [{ name: 'Amoxicillin', dosage: '25mg' }],
      status: 'active',
      createdAt: '2025-09-11T00:00:00Z'
    },
    {
      _id: 'RX-RVCWYZCQ',
      patient: { firstName: 'Lessie', lastName: 'Abbott', age: 30 },
      doctor: { firstName: 'Pierce', lastName: "O'Conner" },
      diagnosis: 'Beatae decet claustrum.',
      medications: [{ name: 'Amoxicillin', dosage: '50mg' }],
      status: 'pending',
      createdAt: '2025-09-11T00:00:00Z'
    },
    {
      _id: 'RX-FSCUAMHX',
      patient: { firstName: 'Velma', lastName: 'Schroeder', age: 31 },
      doctor: { firstName: 'Henri', lastName: 'Schmitt' },
      diagnosis: 'Vitium turpis adipisci damnatio tabgo coius traho converto claustrum tantum.',
      medications: [{ name: 'Ibuprofen', dosage: '500mg' }],
      status: 'pending',
      createdAt: '2025-09-11T00:00:00Z'
    },
    {
      _id: 'RX-ZNIJTVXQ',
      patient: { firstName: 'Maxime', lastName: 'Barrows', age: 62 },
      doctor: { firstName: 'Henri', lastName: 'Schmitt' },
      diagnosis: 'Deorsum soluta quisquam.',
      medications: [{ name: 'Metformin', dosage: '250mg' }],
      status: 'completed',
      createdAt: '2025-09-11T00:00:00Z'
    },
    {
      _id: 'RX-IGQXXQL2',
      patient: { firstName: 'Brando', lastName: 'Sanford', age: 70 },
      doctor: { firstName: 'Henri', lastName: 'Schmitt' },
      diagnosis: 'Dolor porro ademptio folio taceo vomito ager horum.',
      medications: [{ name: 'Amoxicillin', dosage: '50mg' }],
      status: 'active',
      createdAt: '2025-09-11T00:00:00Z'
    },
    {
      _id: 'RX-NIC3LDIF',
      patient: { firstName: 'Lessie', lastName: 'Abbott', age: 30 },
      doctor: { firstName: 'Henri', lastName: 'Schmitt' },
      diagnosis: 'Ter apporto atheus attilio universe in perferendis deduco vitiosus sumopere.',
      medications: [{ name: 'Paracetamol', dosage: '500mg' }],
      status: 'pending',
      createdAt: '2025-09-11T00:00:00Z'
    },
    {
      _id: 'RX-XNSBGQBF',
      patient: { firstName: 'Merle', lastName: 'Prosacco', age: 53 },
      doctor: { firstName: 'Lura', lastName: 'Weimann' },
      diagnosis: 'Pax antea admoneo ventus benevolentia suppellex superior natus reprehendo.',
      medications: [{ name: 'Lisinopril', dosage: '50mg' }],
      status: 'completed',
      createdAt: '2025-09-11T00:00:00Z'
    },
    {
      _id: 'RX-LYXD7GMZ',
      patient: { firstName: 'Princess', lastName: 'Stretch', age: 19 },
      doctor: { firstName: 'Lura', lastName: 'Weimann' },
      diagnosis: 'Curso delego cursus culpa.',
      medications: [{ name: 'Paracetamol', dosage: '100mg' }],
      status: 'active',
      createdAt: '2025-09-11T00:00:00Z'
    }
  ];

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { text: 'Activa', class: 'status-active', icon: '✅' },
      pending: { text: 'Pendiente', class: 'status-pending', icon: '⏳' },
      completed: { text: 'Completada', class: 'status-completed', icon: '✅' },
      dispensed: { text: 'Dispensada', class: 'status-dispensed', icon: '💊' }
    };
    
    const statusInfo = statusMap[status] || { text: status, class: 'status-default', icon: '📋' };
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.icon} {statusInfo.text}
      </span>
    );
  };

  return (
    <div className="prescriptions">
      <div className="page-header">
        <div className="header-content">
          <h1>{t('prescriptions.title')}</h1>
          <p>{t('prescriptions.subtitle')}</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary">{t('prescriptions.newPrescription')}</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats.totalPrescriptions}</h3>
            <p>{t('prescriptions.totalPrescriptions')}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.active}</h3>
            <p>{t('prescriptions.active')}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>{t('prescriptions.pending')}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💊</div>
          <div className="stat-content">
            <h3>{stats.dispensed}</h3>
            <p>{t('prescriptions.dispensed')}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder={t('prescriptions.searchPlaceholder')}
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>
        <div className="filter-dropdowns">
          <select 
            value={filters.status} 
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">{t('prescriptions.allStatuses')}</option>
            <option value="active">{t('prescriptions.active')}</option>
            <option value="pending">{t('prescriptions.pending')}</option>
            <option value="completed">{t('prescriptions.completed')}</option>
            <option value="dispensed">{t('prescriptions.dispensed')}</option>
          </select>
          
          <select 
            value={filters.doctor} 
            onChange={(e) => setFilters({...filters, doctor: e.target.value})}
          >
            <option value="all">{t('prescriptions.allDoctors')}</option>
            <option value="dr-schmitt">Henri Schmitt</option>
            <option value="dr-weimann">Lura Weimann</option>
            <option value="dr-barton">Deshawn Barton</option>
            <option value="dr-oconner">Pierce O'Conner</option>
          </select>

          <select 
            value={filters.timeRange} 
            onChange={(e) => setFilters({...filters, timeRange: e.target.value})}
          >
            <option value="all">{t('prescriptions.allTime')}</option>
            <option value="today">{t('prescriptions.today')}</option>
            <option value="week">{t('prescriptions.thisWeek')}</option>
            <option value="month">{t('prescriptions.thisMonth')}</option>
          </select>
        </div>
      </div>

      {/* Prescriptions Records Table */}
      <div className="prescriptions-section">
        <div className="section-header">
          <h2>{t('prescriptions.recordsTitle')}</h2>
          <p>{t('prescriptions.recordsSubtitle')}</p>
        </div>

        <div className="prescriptions-table">
          <div className="table-header">
            <div className="col-prescription">{t('prescriptions.prescription')}</div>
            <div className="col-patient">{t('prescriptions.patient')}</div>
            <div className="col-doctor">{t('prescriptions.doctor')}</div>
            <div className="col-diagnosis">{t('prescriptions.diagnosis')}</div>
            <div className="col-medications">{t('prescriptions.medications')}</div>
            <div className="col-status">{t('prescriptions.status')}</div>
            <div className="col-date">{t('prescriptions.date')}</div>
            <div className="col-actions">{t('prescriptions.actions')}</div>
          </div>

          <div className="table-body">
            {(prescriptions.length > 0 ? prescriptions : mockPrescriptions).map((prescription) => (
              <div key={prescription._id} className="table-row">
                <div className="col-prescription">
                  <div className="prescription-info">
                    <div className="prescription-icon">📋</div>
                    <div>
                      <h4>{prescription._id}</h4>
                    </div>
                  </div>
                </div>

                <div className="col-patient">
                  <div className="patient-info">
                    <h4>{prescription.patient.firstName} {prescription.patient.lastName}</h4>
                    <p>{t('prescriptions.age')}: {prescription.patient.age}</p>
                  </div>
                </div>

                <div className="col-doctor">
                  <p>{prescription.doctor.firstName} {prescription.doctor.lastName}</p>
                </div>

                <div className="col-diagnosis">
                  <p className="diagnosis-text">{prescription.diagnosis}</p>
                </div>

                <div className="col-medications">
                  <div className="medications-list">
                    {prescription.medications.map((med, index) => (
                      <div key={index} className="medication-item">
                        <span className="med-name">{med.name}</span>
                        <span className="med-dosage">{med.dosage}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-status">
                  {getStatusBadge(prescription.status)}
                </div>

                <div className="col-date">
                  <p>{new Date(prescription.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="col-actions">
                  <div className="action-buttons">
                    <button className="btn-action">{t('prescriptions.actions')}</button>
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

export default Prescriptions;
