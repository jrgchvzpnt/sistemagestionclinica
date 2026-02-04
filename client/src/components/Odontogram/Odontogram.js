import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../Common.css';
import './Odontogram.css';

const Odontogram = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalPatients: 8,
    completionRate: 99,
    activeTreatments: 4,
    totalRevenue: 12016.45
  });
  const [filters, setFilters] = useState({
    search: '',
    doctor: 'all',
    timeRange: 'recent',
    specialty: 'all',
    activeOnly: false
  });
  const [odontograms, setOdontograms] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchOdontograms();
    fetchStats();
  }, [filters]);

  const fetchOdontograms = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.doctor !== 'all') queryParams.append('doctor', filters.doctor);
      if (filters.activeOnly) queryParams.append('status', 'active');

      const response = await fetch(`/api/odontograms?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setOdontograms(data.odontograms || []);
    } catch (error) {
      console.error('Error fetching odontograms:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/odontograms/stats/dashboard', {
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

  const mockOdontograms = [
    {
      _id: '1',
      patient: { firstName: 'Brando', lastName: 'Sanford', age: 70 },
      doctor: { firstName: 'Dr. Lura', lastName: 'Weimann' },
      examDate: '2025-07-19T18:03:00Z',
      version: 'v2',
      status: 'Active',
      progress: 0,
      treatments: 9,
      teethAffected: [11, 12, 21, 22]
    },
    {
      _id: '2',
      patient: { firstName: 'Merle', lastName: 'Prosacco', age: 53 },
      doctor: { firstName: 'Dr. Deshawn', lastName: 'Barton' },
      examDate: '2025-07-12T21:15:00Z',
      version: 'v3',
      status: 'Active',
      progress: 13,
      treatments: 8,
      teethAffected: [31, 32, 41, 42]
    },
    {
      _id: '3',
      patient: { firstName: 'Maxime', lastName: 'Barrows', age: 62 },
      doctor: { firstName: 'Dr. Deshawn', lastName: 'Barton' },
      examDate: '2025-07-08T14:03:00Z',
      version: 'v2',
      status: 'Inactive',
      progress: 13,
      treatments: 8,
      teethAffected: [13, 14, 23, 24]
    },
    {
      _id: '4',
      patient: { firstName: 'Malcolm', lastName: 'Jerde', age: 42 },
      doctor: { firstName: 'Dr. Pierce', lastName: "O'Conner" },
      examDate: '2025-07-08T14:06:00Z',
      version: 'v2',
      status: 'Inactive',
      progress: 13,
      treatments: 16,
      teethAffected: [15, 16, 25, 26]
    },
    {
      _id: '5',
      patient: { firstName: 'Princess', lastName: 'Stretch', age: 19 },
      doctor: { firstName: 'Dr. Deshawn', lastName: 'Barton' },
      examDate: '2025-06-26T10:04:00Z',
      version: 'v2',
      status: 'Active',
      progress: 7,
      treatments: 15,
      teethAffected: [17, 18, 27, 28]
    }
  ];

  const getStatusBadge = (status) => {
    return (
      <span className={`status-badge ${status.toLowerCase()}`}>
        {status}
      </span>
    );
  };

  const getProgressBar = (progress) => {
    const progressColor = progress < 30 ? '#ff4757' : progress < 70 ? '#ffa502' : '#2ed573';
    return (
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%`, backgroundColor: progressColor }}
          ></div>
        </div>
        <span className="progress-text">{progress}%</span>
      </div>
    );
  };

  const handleViewOdontogram = (recordId) => {
    const record = (odontograms.length > 0 ? odontograms : mockOdontograms).find(r => r._id === recordId);
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const handleViewHistory = (recordId) => {
    const record = (odontograms.length > 0 ? odontograms : mockOdontograms).find(r => r._id === recordId);
    setSelectedRecord(record);
    setShowHistoryModal(true);
  };

  const handleUpdateStats = () => {
    // Refresh stats
    fetchStats();
    alert('Estadísticas actualizadas');
  };

  const handleNewOdontogram = () => {
    // TODO: Implement new odontogram functionality
    alert('Crear nuevo odontograma - Funcionalidad próximamente');
  };

  return (
    <div className="odontogram">
      <div className="page-header">
        <div className="header-content">
          <h1>{t('odontogram.title')}</h1>
          <p>{t('odontogram.subtitle')}</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleUpdateStats}>
            <span>🔄</span>
            {t('odontogram.updateStats')}
          </button>
          <button className="btn-secondary" onClick={() => handleViewOdontogram('1')}>
            <span>👁️</span>
            Test Ver Modal
          </button>
          <button className="btn-secondary" onClick={() => handleViewHistory('1')}>
            <span>📋</span>
            Test History Modal
          </button>
          <button className="btn-primary" onClick={handleNewOdontogram}>
            <span>➕</span>
            {t('odontogram.newOdontogram')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalPatients}</h3>
            <p>{t('odontogram.totalPatients')}</p>
            <span className="stat-note">{t('odontogram.withDentalCharts')}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.completionRate}%</h3>
            <p>{t('odontogram.completionRate')}</p>
            <span className="stat-note">{t('odontogram.treatmentCompletion')}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🦷</div>
          <div className="stat-content">
            <h3>{stats.activeTreatments}</h3>
            <p>{t('odontogram.activeTreatments')}</p>
            <span className="stat-note">{t('odontogram.inProgress')}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>${stats.totalRevenue?.toLocaleString() || '12,016.45'}</h3>
            <p>{t('odontogram.totalRevenue')}</p>
            <span className="stat-note">{t('odontogram.estimatedValue')}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder={t('odontogram.searchPlaceholder')}
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>
        <div className="filter-dropdowns">
          <select 
            value={filters.doctor} 
            onChange={(e) => setFilters({...filters, doctor: e.target.value})}
          >
            <option value="all">{t('odontogram.allDoctors')}</option>
            <option value="dr-weimann">Dr. Lura Weimann</option>
            <option value="dr-barton">Dr. Deshawn Barton</option>
            <option value="dr-oconner">Dr. Pierce O'Conner</option>
          </select>
          
          <select 
            value={filters.timeRange} 
            onChange={(e) => setFilters({...filters, timeRange: e.target.value})}
          >
            <option value="recent">{t('odontogram.mostRecent')}</option>
            <option value="week">{t('odontogram.thisWeek')}</option>
            <option value="month">{t('odontogram.thisMonth')}</option>
          </select>

          <select 
            value={filters.specialty} 
            onChange={(e) => setFilters({...filters, specialty: e.target.value})}
          >
            <option value="all">{t('odontogram.allSpecialties')}</option>
            <option value="general">{t('odontogram.general')}</option>
            <option value="orthodontics">{t('odontogram.orthodontics')}</option>
            <option value="endodontics">{t('odontogram.endodontics')}</option>
          </select>

          <label className="checkbox-filter">
            <input
              type="checkbox"
              checked={filters.activeOnly}
              onChange={(e) => setFilters({...filters, activeOnly: e.target.checked})}
            />
            {t('odontogram.activeOnly')}
          </label>
        </div>
      </div>

      {/* Dental Records Table */}
      <div className="records-section">
        <div className="section-header">
          <h2>{t('odontogram.dentalRecords')}</h2>
          <p>{t('odontogram.recordsSubtitle')}</p>
        </div>

        <div className="records-table">
          <div className="table-header">
            <div className="col-patient">{t('odontogram.patient')}</div>
            <div className="col-doctor">{t('odontogram.doctor')}</div>
            <div className="col-exam-date">{t('odontogram.examDate')}</div>
            <div className="col-version">{t('odontogram.version')}</div>
            <div className="col-status">{t('odontogram.status')}</div>
            <div className="col-progress">{t('odontogram.progress')}</div>
            <div className="col-treatments">{t('odontogram.treatments')}</div>
            <div className="col-actions">{t('odontogram.actions')}</div>
          </div>

          <div className="table-body">
            {(odontograms.length > 0 ? odontograms : mockOdontograms).map((record) => (
              <div key={record._id} className="table-row">
                <div className="col-patient">
                  <div className="patient-info">
                    <div className="patient-avatar">👤</div>
                    <div>
                      <h4>{record.patient.firstName} {record.patient.lastName}</h4>
                      <p>{t('odontogram.age')}: {record.patient.age}</p>
                    </div>
                  </div>
                </div>

                <div className="col-doctor">
                  <p>{record.doctor.firstName} {record.doctor.lastName}</p>
                </div>

                <div className="col-exam-date">
                  <div className="date-info">
                    <p>📅 {new Date(record.examDate).toLocaleDateString()}</p>
                    <p>🕐 {new Date(record.examDate).toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className="col-version">
                  <span className="version-badge">{record.version}</span>
                </div>

                <div className="col-status">
                  {getStatusBadge(record.status)}
                </div>

                <div className="col-progress">
                  {getProgressBar(record.progress)}
                </div>

                <div className="col-treatments">
                  <div className="treatments-info">
                    <p>{record.treatments}/{record.treatments} {t('odontogram.treatments')}</p>
                  </div>
                </div>

                <div className="col-actions">
                  <div className="action-buttons">
                    <button 
                      className="btn-action view" 
                      onClick={() => handleViewOdontogram(record._id)}
                    >
                      👁️ {t('odontogram.view')}
                    </button>
                    <button 
                      className="btn-action history" 
                      onClick={() => handleViewHistory(record._id)}
                    >
                      📋 {t('odontogram.history')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* View Odontogram Modal */}
      {showViewModal && selectedRecord && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🦷 Ver Odontograma</h2>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="patient-header">
                <div className="patient-avatar-large">👤</div>
                <div className="patient-details">
                  <h3>{selectedRecord.patient.firstName} {selectedRecord.patient.lastName}</h3>
                  <p>Edad: {selectedRecord.patient.age} años</p>
                  <p>Doctor: {selectedRecord.doctor.firstName} {selectedRecord.doctor.lastName}</p>
                  <p>Fecha de examen: {new Date(selectedRecord.examDate).toLocaleDateString()}</p>
                </div>
                <div className="record-status">
                  {getStatusBadge(selectedRecord.status)}
                  <span className="version-badge">{selectedRecord.version}</span>
                </div>
              </div>

              <div className="odontogram-section">
                <h4>🦷 Mapa Dental</h4>
                <div className="teeth-grid">
                  {/* Upper jaw */}
                  <div className="jaw-section upper">
                    <h5>Maxilar Superior</h5>
                    <div className="teeth-row">
                      {[18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28].map(tooth => (
                        <div 
                          key={tooth} 
                          className={`tooth ${selectedRecord.teethAffected?.includes(tooth) ? 'affected' : ''}`}
                        >
                          <span className="tooth-number">{tooth}</span>
                          <div className="tooth-icon">🦷</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Lower jaw */}
                  <div className="jaw-section lower">
                    <h5>Maxilar Inferior</h5>
                    <div className="teeth-row">
                      {[48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38].map(tooth => (
                        <div 
                          key={tooth} 
                          className={`tooth ${selectedRecord.teethAffected?.includes(tooth) ? 'affected' : ''}`}
                        >
                          <span className="tooth-number">{tooth}</span>
                          <div className="tooth-icon">🦷</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="treatment-summary">
                <h4>📋 Resumen de Tratamiento</h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Progreso:</span>
                    {getProgressBar(selectedRecord.progress)}
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Tratamientos:</span>
                    <span className="summary-value">{selectedRecord.treatments} procedimientos</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Dientes afectados:</span>
                    <span className="summary-value">{selectedRecord.teethAffected?.length || 0} dientes</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowViewModal(false)}>Cerrar</button>
              <button className="btn-primary">Editar Odontograma</button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedRecord && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Historial de Tratamientos</h2>
              <button className="modal-close" onClick={() => setShowHistoryModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="patient-header">
                <div className="patient-avatar-large">👤</div>
                <div className="patient-details">
                  <h3>{selectedRecord.patient.firstName} {selectedRecord.patient.lastName}</h3>
                  <p>Edad: {selectedRecord.patient.age} años</p>
                </div>
              </div>

              <div className="history-timeline">
                <h4>📅 Cronología de Tratamientos</h4>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-date">19 Jul 2025</div>
                    <div className="timeline-content">
                      <h5>Examen inicial</h5>
                      <p>Evaluación completa del estado dental. Se identificaron {selectedRecord.teethAffected?.length || 0} dientes que requieren tratamiento.</p>
                      <span className="timeline-doctor">Dr. {selectedRecord.doctor.lastName}</span>
                    </div>
                  </div>
                  
                  <div className="timeline-item">
                    <div className="timeline-date">22 Jul 2025</div>
                    <div className="timeline-content">
                      <h5>Limpieza dental</h5>
                      <p>Profilaxis completa y aplicación de flúor.</p>
                      <span className="timeline-doctor">Dr. {selectedRecord.doctor.lastName}</span>
                    </div>
                  </div>
                  
                  <div className="timeline-item">
                    <div className="timeline-date">25 Jul 2025</div>
                    <div className="timeline-content">
                      <h5>Tratamiento de caries</h5>
                      <p>Restauración de dientes afectados con resina compuesta.</p>
                      <span className="timeline-doctor">Dr. {selectedRecord.doctor.lastName}</span>
                    </div>
                  </div>
                  
                  {selectedRecord.progress > 50 && (
                    <div className="timeline-item">
                      <div className="timeline-date">28 Jul 2025</div>
                      <div className="timeline-content">
                        <h5>Control post-tratamiento</h5>
                        <p>Revisión del progreso y ajustes necesarios.</p>
                        <span className="timeline-doctor">Dr. {selectedRecord.doctor.lastName}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="treatment-notes">
                <h4>📝 Notas del Tratamiento</h4>
                <div className="notes-content">
                  <p>• Paciente presenta buena higiene oral</p>
                  <p>• Responde bien al tratamiento</p>
                  <p>• Se recomienda control cada 6 meses</p>
                  <p>• Progreso actual: {selectedRecord.progress}%</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowHistoryModal(false)}>Cerrar</button>
              <button className="btn-primary">Agregar Nota</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Odontogram;
