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
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showNewPrescriptionModal, setShowNewPrescriptionModal] = useState(false);

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

  const handleActionClick = (prescription) => {
    setSelectedPrescription(prescription);
    setShowActionModal(true);
  };

  const handleNewPrescription = () => {
    setShowNewPrescriptionModal(true);
  };

  const handleUpdatePrescriptionStatus = async (prescriptionId, newStatus) => {
    try {
      const response = await fetch(`/api/prescriptions/${prescriptionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        // Update local state
        setPrescriptions(prev => prev.map(p => 
          p._id === prescriptionId ? { ...p, status: newStatus } : p
        ));
        setShowActionModal(false);
        alert(`Receta actualizada a: ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating prescription:', error);
      alert('Error al actualizar la receta');
    }
  };

  const handlePrintPrescription = (prescription) => {
    // Create a printable prescription
    const printWindow = window.open('', '_blank');
    const printContent = `
      <html>
        <head>
          <title>Receta Médica - ${prescription._id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .prescription-info { margin-bottom: 20px; }
            .medications { border: 1px solid #ccc; padding: 15px; margin: 20px 0; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RECETA MÉDICA</h1>
            <p>ID: ${prescription._id}</p>
          </div>
          <div class="prescription-info">
            <p><strong>Paciente:</strong> ${prescription.patient.firstName} ${prescription.patient.lastName}</p>
            <p><strong>Edad:</strong> ${prescription.patient.age} años</p>
            <p><strong>Doctor:</strong> ${prescription.doctor.firstName} ${prescription.doctor.lastName}</p>
            <p><strong>Fecha:</strong> ${new Date(prescription.createdAt).toLocaleDateString()}</p>
            <p><strong>Diagnóstico:</strong> ${prescription.diagnosis}</p>
          </div>
          <div class="medications">
            <h3>Medicamentos Prescritos:</h3>
            ${prescription.medications.map(med => `
              <p><strong>${med.name}</strong> - ${med.dosage}</p>
            `).join('')}
          </div>
          <div class="footer">
            <p>Esta receta fue generada electrónicamente el ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDeletePrescription = async (prescriptionId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta receta?')) {
      try {
        const response = await fetch(`/api/prescriptions/${prescriptionId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          setPrescriptions(prev => prev.filter(p => p._id !== prescriptionId));
          setShowActionModal(false);
          alert('Receta eliminada exitosamente');
        }
      } catch (error) {
        console.error('Error deleting prescription:', error);
        alert('Error al eliminar la receta');
      }
    }
  };

  const refreshData = () => {
    fetchPrescriptions();
    fetchStats();
  };

  return (
    <div className="prescriptions">
      <div className="page-header">
        <div className="header-content">
          <h1>{t('prescriptions.title')}</h1>
          <p>{t('prescriptions.subtitle')}</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={handleNewPrescription}>
            ➕ {t('prescriptions.newPrescription')}
          </button>
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
                    <button 
                      className="btn-action" 
                      onClick={() => handleActionClick(prescription)}
                    >
                      ⚙️ Acciones
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal && selectedPrescription && (
        <div className="modal-overlay" onClick={() => setShowActionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💊 Acciones para Receta {selectedPrescription._id}</h2>
              <button className="modal-close" onClick={() => setShowActionModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="prescription-details">
                <div className="prescription-icon-large">📋</div>
                <div className="prescription-info-modal">
                  <h3>Receta {selectedPrescription._id}</h3>
                  <p>👤 Paciente: {selectedPrescription.patient.firstName} {selectedPrescription.patient.lastName}</p>
                  <p>🩺 Doctor: {selectedPrescription.doctor.firstName} {selectedPrescription.doctor.lastName}</p>
                  <p>📅 Fecha: {new Date(selectedPrescription.createdAt).toLocaleDateString()}</p>
                  <p>🔍 Diagnóstico: {selectedPrescription.diagnosis}</p>
                  <div className="medications-info">
                    <p><strong>💊 Medicamentos:</strong></p>
                    {selectedPrescription.medications.map((med, index) => (
                      <p key={index}>• {med.name} - {med.dosage}</p>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="action-buttons-grid">
                <button 
                  className="action-btn print-btn"
                  onClick={() => handlePrintPrescription(selectedPrescription)}
                >
                  🖨️ Imprimir Receta
                </button>
                
                <button 
                  className="action-btn active-btn"
                  onClick={() => handleUpdatePrescriptionStatus(selectedPrescription._id, 'active')}
                  disabled={selectedPrescription.status === 'active'}
                >
                  ✅ Marcar como Activa
                </button>
                
                <button 
                  className="action-btn pending-btn"
                  onClick={() => handleUpdatePrescriptionStatus(selectedPrescription._id, 'pending')}
                  disabled={selectedPrescription.status === 'pending'}
                >
                  ⏳ Marcar como Pendiente
                </button>
                
                <button 
                  className="action-btn completed-btn"
                  onClick={() => handleUpdatePrescriptionStatus(selectedPrescription._id, 'completed')}
                  disabled={selectedPrescription.status === 'completed'}
                >
                  ✅ Marcar como Completada
                </button>
                
                <button 
                  className="action-btn dispensed-btn"
                  onClick={() => handleUpdatePrescriptionStatus(selectedPrescription._id, 'dispensed')}
                  disabled={selectedPrescription.status === 'dispensed'}
                >
                  💊 Marcar como Dispensada
                </button>
                
                <button 
                  className="action-btn edit-btn"
                  onClick={() => {
                    setShowActionModal(false);
                    alert('Función de edición próximamente disponible');
                  }}
                >
                  ✏️ Editar Receta
                </button>
                
                <button 
                  className="action-btn duplicate-btn"
                  onClick={() => {
                    setShowActionModal(false);
                    alert('Función de duplicar próximamente disponible');
                  }}
                >
                  📋 Duplicar Receta
                </button>
                
                <button 
                  className="action-btn delete-btn"
                  onClick={() => handleDeletePrescription(selectedPrescription._id)}
                >
                  🗑️ Eliminar Receta
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowActionModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Prescription Modal */}
      {showNewPrescriptionModal && (
        <div className="modal-overlay" onClick={() => setShowNewPrescriptionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Nueva Receta Médica</h2>
              <button className="modal-close" onClick={() => setShowNewPrescriptionModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="new-prescription-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Paciente *</label>
                    <select>
                      <option value="">Seleccione un paciente</option>
                      <option value="1">Ariane McKenzie</option>
                      <option value="2">Lessie Abbott</option>
                      <option value="3">Brando Sanford</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Doctor *</label>
                    <select>
                      <option value="">Seleccione un doctor</option>
                      <option value="1">Henri Schmitt</option>
                      <option value="2">Lura Weimann</option>
                      <option value="3">Deshawn Barton</option>
                      <option value="4">Pierce O'Conner</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group full-width">
                  <label>Diagnóstico *</label>
                  <textarea placeholder="Ingrese el diagnóstico médico..." rows="3"></textarea>
                </div>
                
                <div className="medications-section">
                  <h4>💊 Medicamentos</h4>
                  <div className="medication-entry">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Medicamento *</label>
                        <input type="text" placeholder="Nombre del medicamento" />
                      </div>
                      <div className="form-group">
                        <label>Dosis *</label>
                        <input type="text" placeholder="Ej: 500mg" />
                      </div>
                      <div className="form-group">
                        <label>Frecuencia</label>
                        <input type="text" placeholder="Ej: Cada 8 horas" />
                      </div>
                      <div className="form-group">
                        <label>Duración</label>
                        <input type="text" placeholder="Ej: 7 días" />
                      </div>
                    </div>
                  </div>
                  <button type="button" className="btn-secondary add-medication">
                    ➕ Agregar Medicamento
                  </button>
                </div>
                
                <div className="form-group full-width">
                  <label>Instrucciones Adicionales</label>
                  <textarea placeholder="Instrucciones especiales para el paciente..." rows="2"></textarea>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowNewPrescriptionModal(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={() => {
                setShowNewPrescriptionModal(false);
                alert('Función de crear receta próximamente disponible');
              }}>
                💾 Crear Receta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
