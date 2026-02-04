import React, { useState, useEffect } from 'react';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'operador',
    department: '',
    phone: '',
    status: 'activo'
  });

  // Roles disponibles con sus permisos
  const roles = {
    administrador: {
      name: 'Administrador',
      permissions: ['dashboard', 'patients', 'appointments', 'ai-analysis', 'odontogram', 'prospects', 'prescriptions', 'billing', 'lab-providers', 'users'],
      color: '#dc2626',
      icon: '👑'
    },
    doctor: {
      name: 'Doctor',
      permissions: ['dashboard', 'patients', 'appointments', 'ai-analysis', 'odontogram', 'prescriptions'],
      color: '#2563eb',
      icon: '👨‍⚕️'
    },
    enfermera: {
      name: 'Enfermera',
      permissions: ['dashboard', 'patients', 'appointments', 'prescriptions'],
      color: '#059669',
      icon: '👩‍⚕️'
    },
    recepcionista: {
      name: 'Recepcionista',
      permissions: ['dashboard', 'patients', 'appointments', 'prospects', 'billing'],
      color: '#7c3aed',
      icon: '👩‍💼'
    },
    laboratorio: {
      name: 'Técnico de Laboratorio',
      permissions: ['dashboard', 'ai-analysis', 'lab-providers'],
      color: '#ea580c',
      icon: '🧪'
    },
    operador: {
      name: 'Operador',
      permissions: ['dashboard', 'patients', 'appointments'],
      color: '#64748b',
      icon: '👤'
    }
  };

  // Datos de ejemplo
  useEffect(() => {
    const mockUsers = [
      {
        id: 1,
        name: 'Dr. María González',
        email: 'maria.gonzalez@insightdental.com',
        role: 'administrador',
        department: 'Dirección Médica',
        phone: '+52 123 456 7890',
        status: 'activo',
        lastLogin: '2024-02-03 09:30:00',
        createdAt: '2024-01-15'
      },
      {
        id: 2,
        name: 'Dr. Carlos Rodríguez',
        email: 'carlos.rodriguez@insightdental.com',
        role: 'doctor',
        department: 'Odontología General',
        phone: '+52 123 456 7891',
        status: 'activo',
        lastLogin: '2024-02-03 08:15:00',
        createdAt: '2024-01-20'
      },
      {
        id: 3,
        name: 'Ana Martínez',
        email: 'ana.martinez@insightdental.com',
        role: 'enfermera',
        department: 'Enfermería',
        phone: '+52 123 456 7892',
        status: 'activo',
        lastLogin: '2024-02-03 07:45:00',
        createdAt: '2024-01-25'
      },
      {
        id: 4,
        name: 'Laura Fernández',
        email: 'laura.fernandez@insightdental.com',
        role: 'recepcionista',
        department: 'Recepción',
        phone: '+52 123 456 7893',
        status: 'activo',
        lastLogin: '2024-02-03 08:00:00',
        createdAt: '2024-02-01'
      },
      {
        id: 5,
        name: 'Pedro López',
        email: 'pedro.lopez@insightdental.com',
        role: 'laboratorio',
        department: 'Laboratorio',
        phone: '+52 123 456 7894',
        status: 'inactivo',
        lastLogin: '2024-02-01 16:30:00',
        createdAt: '2024-01-10'
      }
    ];
    setUsers(mockUsers);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingUser) {
      // Editar usuario existente
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...formData, updatedAt: new Date().toISOString().split('T')[0] }
          : user
      ));
    } else {
      // Crear nuevo usuario
      const newUser = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: 'Nunca'
      };
      setUsers(prev => [...prev, newUser]);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'operador',
      department: '',
      phone: '',
      status: 'activo'
    });
    setEditingUser(null);
    setShowModal(false);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      phone: user.phone,
      status: user.status
    });
    setShowModal(true);
  };

  const handleDelete = (userId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  const toggleUserStatus = (userId) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'activo' ? 'inactivo' : 'activo' }
        : user
    ));
  };

  const formatDate = (dateString) => {
    if (dateString === 'Nunca') return dateString;
    return new Date(dateString).toLocaleString('es-ES');
  };

  return (
    <div className="users-container">
      <div className="users-header">
        <div className="header-content">
          <h1>Gestión de Usuarios</h1>
          <p>Administra los usuarios del sistema y sus permisos</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowModal(true)}
        >
          <span className="btn-icon">👤</span>
          Nuevo Usuario
        </button>
      </div>

      {/* Estadísticas de usuarios */}
      <div className="users-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{users.length}</h3>
            <p>Total Usuarios</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{users.filter(u => u.status === 'activo').length}</h3>
            <p>Usuarios Activos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👑</div>
          <div className="stat-content">
            <h3>{users.filter(u => u.role === 'administrador').length}</h3>
            <p>Administradores</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍⚕️</div>
          <div className="stat-content">
            <h3>{users.filter(u => u.role === 'doctor').length}</h3>
            <p>Doctores</p>
          </div>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="users-table-container">
        <div className="table-header">
          <h2>Lista de Usuarios</h2>
        </div>
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Departamento</th>
                <th>Estado</th>
                <th>Último Acceso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar" style={{ backgroundColor: roles[user.role]?.color }}>
                        {roles[user.role]?.icon}
                      </div>
                      <div className="user-details">
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="role-badge" style={{ backgroundColor: roles[user.role]?.color }}>
                      {roles[user.role]?.name}
                    </span>
                  </td>
                  <td>{user.department}</td>
                  <td>
                    <span className={`status-badge ${user.status}`}>
                      {user.status === 'activo' ? '✅ Activo' : '❌ Inactivo'}
                    </span>
                  </td>
                  <td>{formatDate(user.lastLogin)}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-edit"
                        onClick={() => handleEdit(user)}
                        title="Editar usuario"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-toggle"
                        onClick={() => toggleUserStatus(user.id)}
                        title={user.status === 'activo' ? 'Desactivar' : 'Activar'}
                      >
                        {user.status === 'activo' ? '🔒' : '🔓'}
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(user.id)}
                        title="Eliminar usuario"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para crear/editar usuario */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button className="modal-close" onClick={resetForm}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Dr. Juan Pérez"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="usuario@insightdental.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Rol</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    {Object.entries(roles).map(([key, role]) => (
                      <option key={key} value={key}>
                        {role.icon} {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Departamento</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Odontología General"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+52 123 456 7890"
                  />
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="activo">✅ Activo</option>
                    <option value="inactivo">❌ Inactivo</option>
                  </select>
                </div>
              </div>

              {/* Mostrar permisos del rol seleccionado */}
              <div className="permissions-preview">
                <h3>Permisos del Rol: {roles[formData.role]?.name}</h3>
                <div className="permissions-list">
                  {roles[formData.role]?.permissions.map(permission => (
                    <span key={permission} className="permission-badge">
                      {permission === 'dashboard' && '📊 Dashboard'}
                      {permission === 'patients' && '👥 Pacientes'}
                      {permission === 'appointments' && '📅 Citas'}
                      {permission === 'ai-analysis' && '🤖 Análisis IA'}
                      {permission === 'odontogram' && '🦷 Odontograma'}
                      {permission === 'prospects' && '🎯 Prospectos'}
                      {permission === 'prescriptions' && '💊 Recetas'}
                      {permission === 'billing' && '💰 Facturación'}
                      {permission === 'lab-providers' && '🏥 Laboratorios'}
                      {permission === 'users' && '👥 Usuarios'}
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={resetForm}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  {editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
