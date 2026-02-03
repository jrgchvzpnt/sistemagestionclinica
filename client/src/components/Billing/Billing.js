import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './Billing.css';

const Billing = () => {
  const { t } = useTranslation();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBill, setSelectedBill] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'
  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    services: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    paymentMethod: '',
    insuranceProvider: '',
    insuranceCoverage: 0,
    notes: ''
  });

  // Datos de ejemplo
  const sampleBills = [
    {
      _id: '1',
      billNumber: 'FAC-2024-001',
      patientName: 'María González',
      patientEmail: 'maria.gonzalez@email.com',
      date: '2024-02-15',
      dueDate: '2024-03-15',
      services: [
        { name: 'Consulta General', quantity: 1, price: 50, total: 50 },
        { name: 'Limpieza Dental', quantity: 1, price: 80, total: 80 }
      ],
      subtotal: 130,
      tax: 13,
      discount: 0,
      total: 143,
      status: 'Pagada',
      paymentMethod: 'Tarjeta de Crédito',
      insuranceProvider: 'Seguro Nacional',
      insuranceCoverage: 70,
      patientPayment: 73,
      notes: 'Pago realizado el mismo día'
    },
    {
      _id: '2',
      billNumber: 'FAC-2024-002',
      patientName: 'Carlos Rodríguez',
      patientEmail: 'carlos.rodriguez@email.com',
      date: '2024-02-10',
      dueDate: '2024-03-10',
      services: [
        { name: 'Extracción Dental', quantity: 1, price: 120, total: 120 },
        { name: 'Radiografía', quantity: 2, price: 25, total: 50 }
      ],
      subtotal: 170,
      tax: 17,
      discount: 10,
      total: 177,
      status: 'Pendiente',
      paymentMethod: 'Efectivo',
      insuranceProvider: 'Salud Plus',
      insuranceCoverage: 80,
      patientPayment: 97,
      notes: 'Paciente solicitó plan de pagos'
    },
    {
      _id: '3',
      billNumber: 'FAC-2024-003',
      patientName: 'Ana Martínez',
      patientEmail: 'ana.martinez@email.com',
      date: '2024-02-20',
      dueDate: '2024-03-20',
      services: [
        { name: 'Ortodoncia - Consulta', quantity: 1, price: 100, total: 100 },
        { name: 'Brackets', quantity: 1, price: 800, total: 800 }
      ],
      subtotal: 900,
      tax: 90,
      discount: 50,
      total: 940,
      status: 'Vencida',
      paymentMethod: 'Transferencia',
      insuranceProvider: 'Vida Segura',
      insuranceCoverage: 60,
      patientPayment: 880,
      notes: 'Tratamiento de ortodoncia iniciado'
    }
  ];

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setBills(sampleBills);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.patientEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || bill.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const handleViewBill = (bill) => {
    setSelectedBill(bill);
    setFormData(bill);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEditBill = (bill) => {
    setSelectedBill(bill);
    setFormData(bill);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleCreateBill = () => {
    setSelectedBill(null);
    setFormData({
      patientName: '',
      patientEmail: '',
      services: [],
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      paymentMethod: '',
      insuranceProvider: '',
      insuranceCoverage: 0,
      notes: ''
    });
    setModalMode('create');
    setShowModal(true);
  };

  const handleSaveBill = () => {
    if (modalMode === 'create') {
      const newBill = {
        ...formData,
        _id: Date.now().toString(),
        billNumber: `FAC-2024-${String(bills.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Pendiente'
      };
      setBills([...bills, newBill]);
    } else if (modalMode === 'edit') {
      setBills(bills.map(b => b._id === selectedBill._id ? { ...formData, _id: selectedBill._id } : b));
    }
    setShowModal(false);
  };

  const handleDeleteBill = (billId) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta factura?')) {
      setBills(bills.filter(b => b._id !== billId));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pagada': return 'success';
      case 'pendiente': return 'warning';
      case 'vencida': return 'danger';
      default: return 'secondary';
    }
  };

  const getTotalRevenue = () => {
    return bills.filter(b => b.status === 'Pagada').reduce((sum, bill) => sum + bill.total, 0);
  };

  const getPendingAmount = () => {
    return bills.filter(b => b.status === 'Pendiente').reduce((sum, bill) => sum + bill.total, 0);
  };

  const getOverdueAmount = () => {
    return bills.filter(b => b.status === 'Vencida').reduce((sum, bill) => sum + bill.total, 0);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando facturas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <span className="header-icon">💰</span>
          <div>
            <h1>Facturación y Pagos</h1>
            <p>Gestionar facturas, pagos y seguros médicos</p>
          </div>
        </div>
        <button className="btn-primary" onClick={handleCreateBill}>
          <span className="btn-icon">➕</span>
          Nueva Factura
        </button>
      </div>

      <div className="content-section">
        <div className="filters-section">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar por paciente, número de factura o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Estado:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">Todos</option>
              <option value="pagada">Pagadas</option>
              <option value="pendiente">Pendientes</option>
              <option value="vencida">Vencidas</option>
            </select>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon success">💰</div>
            <div className="stat-content">
              <h3>${getTotalRevenue().toLocaleString()}</h3>
              <p>Ingresos Totales</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon warning">⏳</div>
            <div className="stat-content">
              <h3>${getPendingAmount().toLocaleString()}</h3>
              <p>Facturas Pendientes</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon danger">⚠️</div>
            <div className="stat-content">
              <h3>${getOverdueAmount().toLocaleString()}</h3>
              <p>Facturas Vencidas</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{bills.length}</h3>
              <p>Total Facturas</p>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Factura</th>
                <th>Paciente</th>
                <th>Fecha</th>
                <th>Vencimiento</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map((bill) => (
                <tr key={bill._id}>
                  <td>
                    <div className="bill-info">
                      <div className="bill-number">{bill.billNumber}</div>
                      <div className="payment-method">{bill.paymentMethod}</div>
                    </div>
                  </td>
                  <td>
                    <div className="patient-info">
                      <div className="patient-name">{bill.patientName}</div>
                      <div className="patient-email">{bill.patientEmail}</div>
                    </div>
                  </td>
                  <td>{new Date(bill.date).toLocaleDateString()}</td>
                  <td>{new Date(bill.dueDate).toLocaleDateString()}</td>
                  <td>
                    <div className="amount-info">
                      <div className="total-amount">${bill.total.toLocaleString()}</div>
                      {bill.insuranceProvider && (
                        <div className="insurance-info">
                          Seguro: ${(bill.total * bill.insuranceCoverage / 100).toFixed(0)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusColor(bill.status)}`}>
                      {bill.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon-small"
                        onClick={() => handleViewBill(bill)}
                        title="Ver detalles"
                      >
                        👁️
                      </button>
                      <button
                        className="btn-icon-small"
                        onClick={() => handleEditBill(bill)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon-small"
                        title="Imprimir"
                      >
                        🖨️
                      </button>
                      <button
                        className="btn-icon-small danger"
                        onClick={() => handleDeleteBill(bill._id)}
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

          {filteredBills.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">💰</div>
              <h3>No se encontraron facturas</h3>
              <p>No hay facturas que coincidan con tu búsqueda.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal para ver/editar/crear factura */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === 'create' ? 'Nueva Factura' : 
                 modalMode === 'edit' ? 'Editar Factura' : 'Detalles de la Factura'}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div className="form-section">
                  <h3>Información del Paciente</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombre del Paciente</label>
                      <input
                        type="text"
                        name="patientName"
                        value={formData.patientName}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="patientEmail"
                        value={formData.patientEmail}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Información de Pago</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Método de Pago</label>
                      <select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                      >
                        <option value="">Seleccionar</option>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                        <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                        <option value="Transferencia">Transferencia</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Proveedor de Seguro</label>
                      <input
                        type="text"
                        name="insuranceProvider"
                        value={formData.insuranceProvider}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        placeholder="Opcional"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Cobertura del Seguro (%)</label>
                      <input
                        type="number"
                        name="insuranceCoverage"
                        value={formData.insuranceCoverage}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div className="form-group">
                      <label>Total</label>
                      <input
                        type="number"
                        name="total"
                        value={formData.total}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Notas Adicionales</h3>
                  <div className="form-group">
                    <label>Notas</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      rows="3"
                      placeholder="Información adicional sobre la factura..."
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
                <button className="btn-primary" onClick={handleSaveBill}>
                  {modalMode === 'create' ? 'Crear Factura' : 'Guardar Cambios'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
