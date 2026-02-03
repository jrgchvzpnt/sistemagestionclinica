import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './Patients.css';

const Patients = () => {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    medicalHistory: {
      allergies: [],
      medications: [],
      conditions: []
    },
    insurance: {
      provider: '',
      policyNumber: '',
      groupNumber: ''
    }
  });

  // Datos de ejemplo
  const samplePatients = [
    {
      _id: '1',
      firstName: 'María',
      lastName: 'González',
      email: 'maria.gonzalez@email.com',
      phone: '+1 (555) 123-4567',
      dateOfBirth: '1985-03-15',
      gender: 'Femenino',
      address: '123 Main St, Ciudad, Estado 12345',
      emergencyContact: {
        name: 'Juan González',
        phone: '+1 (555) 987-6543',
        relationship: 'Esposo'
      },
      medicalHistory: {
        allergies: ['Penicilina'],
        medications: ['Ibuprofeno'],
        conditions: ['Hipertensión']
      },
      insurance: {
        provider: 'Seguro Nacional',
        policyNumber: 'SN123456789',
        groupNumber: 'GRP001'
      },
      lastVisit: '2024-02-15',
      status: 'Activo'
    },
    {
      _id: '2',
      firstName: 'Carlos',
      lastName: 'Rodríguez',
      email: 'carlos.rodriguez@email.com',
      phone: '+1 (555) 234-5678',
      dateOfBirth: '1978-07-22',
      gender: 'Masculino',
      address: '456 Oak Ave, Ciudad, Estado 12345',
      emergencyContact: {
        name: 'Ana Rodríguez',
        phone: '+1 (555) 876-5432',
        relationship: 'Esposa'
      },
      medicalHistory: {
        allergies: [],
        medications: ['Aspirina'],
        conditions: ['Diabetes Tipo 2']
      },
      insurance: {
        provider: 'Salud Plus',
        policyNumber: 'SP987654321',
        groupNumber: 'GRP002'
      },
      lastVisit: '2024-02-10',
      status: 'Activo'
    },
    {
      _id: '3',
      firstName: 'Ana',
      lastName: 'Martínez',
      email: 'ana.martinez@email.com',
      phone: '+1 (555) 345-6789',
      dateOfBirth: '1992-11-08',
      gender: 'Femenino',
      address: '789 Pine St, Ciudad, Estado 12345',
      emergencyContact: {
        name: 'Luis Martínez',
        phone: '+1 (555) 765-4321',
        relationship: 'Padre'
      },
      medicalHistory: {
        allergies: ['Mariscos'],
        medications: [],
        conditions: []
      },
      insurance: {
        provider: 'Vida Segura',
        policyNumber: 'VS456789123',
        groupNumber: 'GRP003'
      },
      lastVisit: '2024-02-20',
      status: 'Activo'
    }
  ];

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setPatients(samplePatients);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPatients = patients.filter(patient =>
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setFormData(patient);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setFormData(patient);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleCreatePatient = () => {
    setSelectedPatient(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      },
      medicalHistory: {
        allergies: [],
        medications: [],
        conditions: []
      },
      insurance: {
        provider: '',
        policyNumber: '',
        groupNumber: ''
      }
    });
    setModalMode('create');
    setShowModal(true);
  };

  const handleSavePatient = () => {
    if (modalMode === 'create') {
      const newPatient = {
        ...formData,
        _id: Date.now().toString(),
        lastVisit: new Date().toISOString().split('T')[0],
        status: 'Activo'
      };
      setPatients([...patients, newPatient]);
    } else if (modalMode === 'edit') {
      setPatients(patients.map(p => p._id === selectedPatient._id ? { ...formData, _id: selectedPatient._id } : p));
    }
    setShowModal(false);
  };

  const handleDeletePatient = (patientId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este paciente?')) {
      setPatients(patients.filter(p => p._id !== patientId));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando pacientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <span className="header-icon">👥</span>
          <div>
            <h1>Gestión de Pacientes</h1>
            <p>Administrar información de pacientes y historiales médicos</p>
          </div>
        </div>
        <button className="btn-primary" onClick={handleCreatePatient}>
          <span className="btn-icon">➕</span>
          Nuevo Paciente
        </button>
      </div>

      <div className="content-section">
        <div className="filters-section">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar pacientes por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{patients.length}</h3>
              <p>Total Pacientes</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{patients.filter(p => p.status === 'Activo').length}</h3>
              <p>Pacientes Activos</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>{patients.filter(p => {
                const lastVisit = new Date(p.lastVisit);
                const today = new Date();
                const diffTime = Math.abs(today - lastVisit);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 30;
              }).length}</h3>
              <p>Visitas Recientes</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <h3>{patients.filter(p => p.medicalHistory.allergies.length > 0).length}</h3>
              <p>Con Alergias</p>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Contacto</th>
                <th>Edad</th>
                <th>Última Visita</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient._id}>
                  <td>
                    <div className="patient-info">
                      <div className="patient-avatar">
                        {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                      </div>
                      <div>
                        <div className="patient-name">
                          {patient.firstName} {patient.lastName}
                        </div>
                        <div className="patient-gender">{patient.gender}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div>{patient.email}</div>
                      <div className="phone">{patient.phone}</div>
                    </div>
                  </td>
                  <td>{calculateAge(patient.dateOfBirth)} años</td>
                  <td>{new Date(patient.lastVisit).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${patient.status.toLowerCase()}`}>
                      {patient.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon-small"
                        onClick={() => handleViewPatient(patient)}
                        title="Ver detalles"
                      >
                        👁️
                      </button>
                      <button
                        className="btn-icon-small"
                        onClick={() => handleEditPatient(patient)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon-small danger"
                        onClick={() => handleDeletePatient(patient._id)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPatients.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No se encontraron pacientes</h3>
              <p>No hay pacientes que coincidan con tu búsqueda.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal para ver/editar/crear paciente */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === 'create' ? 'Nuevo Paciente' : 
                 modalMode === 'edit' ? 'Editar Paciente' : 'Detalles del Paciente'}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div className="form-section">
                  <h3>Información Personal</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombre</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                      />
                    </div>
                    <div className="form-group">
                      <label>Apellido</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                      />
                    </div>
                    <div className="form-group">
                      <label>Teléfono</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Fecha de Nacimiento</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                      />
                    </div>
                    <div className="form-group">
                      <label>Género</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                      >
                        <option value="">Seleccionar</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Dirección</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      rows="3"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Contacto de Emergencia</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombre</label>
                      <input
                        type="text"
                        name="emergencyContact.name"
                        value={formData.emergencyContact.name}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                      />
                    </div>
                    <div className="form-group">
                      <label>Teléfono</label>
                      <input
                        type="tel"
                        name="emergencyContact.phone"
                        value={formData.emergencyContact.phone}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Relación</label>
                    <input
                      type="text"
                      name="emergencyContact.relationship"
                      value={formData.emergencyContact.relationship}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      placeholder="Ej: Esposo/a, Padre, Madre, Hermano/a"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Información del Seguro</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Proveedor</label>
                      <input
                        type="text"
                        name="insurance.provider"
                        value={formData.insurance.provider}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                      />
                    </div>
                    <div className="form-group">
                      <label>Número de Póliza</label>
                      <input
                        type="text"
                        name="insurance.policyNumber"
                        value={formData.insurance.policyNumber}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Número de Grupo</label>
                    <input
                      type="text"
                      name="insurance.groupNumber"
                      value={formData.insurance.groupNumber}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Historial Médico</h3>
                  <div className="form-group">
                    <label>Alergias</label>
                    <textarea
                      name="allergies"
                      value={formData.medicalHistory.allergies.join(', ')}
                      onChange={(e) => {
                        const allergies = e.target.value.split(',').map(item => item.trim()).filter(item => item);
                        setFormData(prev => ({
                          ...prev,
                          medicalHistory: {
                            ...prev.medicalHistory,
                            allergies
                          }
                        }));
                      }}
                      disabled={modalMode === 'view'}
                      placeholder="Separar con comas"
                      rows="2"
                    />
                  </div>
                  <div className="form-group">
                    <label>Medicamentos Actuales</label>
                    <textarea
                      name="medications"
                      value={formData.medicalHistory.medications.join(', ')}
                      onChange={(e) => {
                        const medications = e.target.value.split(',').map(item => item.trim()).filter(item => item);
                        setFormData(prev => ({
                          ...prev,
                          medicalHistory: {
                            ...prev.medicalHistory,
                            medications
                          }
                        }));
                      }}
                      disabled={modalMode === 'view'}
                      placeholder="Separar con comas"
                      rows="2"
                    />
                  </div>
                  <div className="form-group">
                    <label>Condiciones Médicas</label>
                    <textarea
                      name="conditions"
                      value={formData.medicalHistory.conditions.join(', ')}
                      onChange={(e) => {
                        const conditions = e.target.value.split(',').map(item => item.trim()).filter(item => item);
                        setFormData(prev => ({
                          ...prev,
                          medicalHistory: {
                            ...prev.medicalHistory,
                            conditions
                          }
                        }));
                      }}
                      disabled={modalMode === 'view'}
                      placeholder="Separar con comas"
                      rows="2"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              {modalMode !== 'view' && (
                <button className="btn-primary" onClick={handleSavePatient}>
                  {modalMode === 'create' ? 'Crear Paciente' : 'Guardar Cambios'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
