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
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

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

  const handleActionClick = (prospect) => {
    setSelectedProspect(prospect);
    setShowActionModal(true);
  };

  const handleAddProspect = () => {
    setShowAddModal(true);
  };

  const handleUpdateProspectStatus = async (prospectId, newStatus) => {
    try {
      const response = await fetch(`/api/prospects/${prospectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        // Update local state
        setProspects(prev => prev.map(p => 
          p._id === prospectId ? { ...p, status: newStatus } : p
        ));
        setShowActionModal(false);
        alert(`Prospecto actualizado a: ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating prospect:', error);
      alert('Error al actualizar el prospecto');
    }
  };

  const handleConvertToPatient = async (prospectId) => {
    try {
      const response = await fetch(`/api/prospects/${prospectId}/convert`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        handleUpdateProspectStatus(prospectId, 'converted');
        alert('¡Prospecto convertido a paciente exitosamente!');
      }
    } catch (error) {
      console.error('Error converting prospect:', error);
      alert('Error al convertir el prospecto');
    }
  };

  const handleDeleteProspect = async (prospectId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este prospecto?')) {
      try {
        const response = await fetch(`/api/prospects/${prospectId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          setProspects(prev => prev.filter(p => p._id !== prospectId));
          setShowActionModal(false);
          alert('Prospecto eliminado exitosamente');
        }
      } catch (error) {
        console.error('Error deleting prospect:', error);
        alert('Error al eliminar el prospecto');
      }
    }
  };

  const refreshData = () => {
    fetchProspects();
    fetchStats();
  };

  return (
    <div className="prospects">
      <div className="page-header">
        <div className="header-content">
          <h1>{t('prospects.title')}</h1>
          <p>{t('prospects.subtitle')}</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={refreshData}>
            🔄 {t('prospects.update')}
          </button>
          <button className="btn-primary" onClick={handleAddProspect}>
            ➕ {t('prospects.addProspect')}
          </button>
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
                    <button 
                      className="btn-action" 
                      onClick={() => handleActionClick(prospect)}
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
      {showActionModal && selectedProspect && (
        <div className="modal-overlay" onClick={() => setShowActionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚙️ Acciones para {selectedProspect.firstName} {selectedProspect.lastName}</h2>
              <button className="modal-close" onClick={() => setShowActionModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="prospect-details">
                <div className="prospect-avatar-large">
                  {selectedProspect.firstName.charAt(0)}{selectedProspect.lastName.charAt(0)}
                </div>
                <div className="prospect-info-modal">
                  <h3>{selectedProspect.firstName} {selectedProspect.lastName}</h3>
                  <p>📧 {selectedProspect.email}</p>
                  <p>📞 {selectedProspect.phone}</p>
                  <p>🎯 {selectedProspect.serviceInterest}</p>
                  <p>📍 Fuente: {selectedProspect.source}</p>
                  <p>👤 Asignado a: {selectedProspect.assignedTo.firstName} {selectedProspect.assignedTo.lastName}</p>
                </div>
              </div>
              
              <div className="action-buttons-grid">
                <button 
                  className="action-btn contact-btn"
                  onClick={() => handleUpdateProspectStatus(selectedProspect._id, 'contacted')}
                  disabled={selectedProspect.status === 'contacted'}
                >
                  📞 Marcar como Contactado
                </button>
                
                <button 
                  className="action-btn convert-btn"
                  onClick={() => handleConvertToPatient(selectedProspect._id)}
                  disabled={selectedProspect.status === 'converted'}
                >
                  ✅ Convertir a Paciente
                </button>
                
                <button 
                  className="action-btn lost-btn"
                  onClick={() => handleUpdateProspectStatus(selectedProspect._id, 'lost')}
                  disabled={selectedProspect.status === 'lost'}
                >
                  ❌ Marcar como Perdido
                </button>
                
                <button 
                  className="action-btn new-btn"
                  onClick={() => handleUpdateProspectStatus(selectedProspect._id, 'new')}
                  disabled={selectedProspect.status === 'new'}
                >
                  🆕 Marcar como Nuevo
                </button>
                
                <button 
                  className="action-btn email-btn"
                  onClick={() => window.open(`mailto:${selectedProspect.email}`, '_blank')}
                  disabled={!selectedProspect.email}
                >
                  📧 Enviar Email
                </button>
                
                <button 
                  className="action-btn phone-btn"
                  onClick={() => window.open(`tel:${selectedProspect.phone}`, '_blank')}
                >
                  📱 Llamar
                </button>
                
                <button 
                  className="action-btn edit-btn"
                  onClick={() => {
                    setShowActionModal(false);
                    alert('Función de edición próximamente disponible');
                  }}
                >
                  ✏️ Editar Información
                </button>
                
                <button 
                  className="action-btn delete-btn"
                  onClick={() => handleDeleteProspect(selectedProspect._id)}
                >
                  🗑️ Eliminar Prospecto
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

      {/* Add Prospect Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Agregar Nuevo Prospecto</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="add-prospect-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nombre *</label>
                    <input type="text" placeholder="Ingrese el nombre" />
                  </div>
                  <div className="form-group">
                    <label>Apellido *</label>
                    <input type="text" placeholder="Ingrese el apellido" />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" placeholder="ejemplo@correo.com" />
                  </div>
                  <div className="form-group">
                    <label>Teléfono *</label>
                    <input type="tel" placeholder="Ingrese el teléfono" />
                  </div>
                  <div className="form-group">
                    <label>Fuente *</label>
                    <select>
                      <option value="">Seleccione una fuente</option>
                      <option value="Social">Redes Sociales</option>
                      <option value="Advertisement">Publicidad</option>
                      <option value="Walk-in">Visita Directa</option>
                      <option value="Referral">Referencia</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Servicio de Interés *</label>
                    <input type="text" placeholder="Ej: Consulta General, Ortodoncia" />
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Notas Adicionales</label>
                  <textarea placeholder="Información adicional sobre el prospecto..." rows="3"></textarea>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={() => {
                setShowAddModal(false);
                alert('Función de agregar prospecto próximamente disponible');
              }}>
                💾 Guardar Prospecto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prospects;
