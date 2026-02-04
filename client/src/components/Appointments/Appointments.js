import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './Appointments.css';

const Appointments = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    todayAppointments: 0,
    completed: 2,
    pending: 5,
    cancelled: 3
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'table'
  const [appointments, setAppointments] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    date: 'all'
  });
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    type: 'consultation',
    notes: '',
    duration: 30
  });

  useEffect(() => {
    fetchAppointments();
    fetchStats();
  }, [currentDate, filters]);

  const fetchAppointments = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      
      const response = await fetch(`/api/appointments?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/appointments/stats/dashboard', {
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

  // Mock appointments data based on the image
  const mockAppointments = [
    {
      _id: '1',
      patient: { firstName: 'Princess', lastName: 'Stretch' },
      doctor: { firstName: 'Dr. Lura', lastName: 'Weimann' },
      appointmentDate: '2025-09-12T06:04:00Z',
      type: 'consultation',
      status: 'completed'
    },
    {
      _id: '2',
      patient: { firstName: 'Mehdi', lastName: "O'Keefe" },
      doctor: { firstName: 'Dr. Deshawn', lastName: 'Barton' },
      appointmentDate: '2025-09-12T11:04:00Z',
      type: 'procedure',
      status: 'pending'
    },
    {
      _id: '3',
      patient: { firstName: 'Ariane', lastName: 'McKenzie' },
      doctor: { firstName: 'Dr. Lura', lastName: 'Weimann' },
      appointmentDate: '2025-09-16T07:25:00Z',
      type: 'consultation',
      status: 'pending'
    },
    {
      _id: '4',
      patient: { firstName: 'Ariane', lastName: 'McKenzie' },
      doctor: { firstName: 'Dr. Lura', lastName: 'Weimann' },
      appointmentDate: '2025-09-17T06:10:00Z',
      type: 'consultation',
      status: 'pending'
    },
    {
      _id: '5',
      patient: { firstName: 'Lessie', lastName: 'Abbott' },
      doctor: { firstName: 'Dr. Deshawn', lastName: 'Barton' },
      appointmentDate: '2025-09-19T03:30:00Z',
      type: 'procedure',
      status: 'pending'
    },
    {
      _id: '6',
      patient: { firstName: 'Merle', lastName: 'Prosacco' },
      doctor: { firstName: 'Dr. Pierce', lastName: "O'Conner" },
      appointmentDate: '2025-09-26T06:02:00Z',
      type: 'procedure',
      status: 'pending'
    },
    {
      _id: '7',
      patient: { firstName: 'Lessie', lastName: 'Abbott' },
      doctor: { firstName: 'Dr. Lura', lastName: 'Weimann' },
      appointmentDate: '2025-09-27T09:35:00Z',
      type: 'procedure',
      status: 'pending'
    },
    {
      _id: '8',
      patient: { firstName: 'Ariane', lastName: 'McKenzie' },
      doctor: { firstName: 'Dr. Lura', lastName: 'Weimann' },
      appointmentDate: '2025-10-03T07:18:00Z',
      type: 'check-up',
      status: 'pending'
    }
  ];

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: { text: 'Completada', class: 'status-completed', icon: '✅' },
      pending: { text: 'Pendiente', class: 'status-pending', icon: '⏳' },
      cancelled: { text: 'Cancelada', class: 'status-cancelled', icon: '❌' },
      scheduled: { text: 'Programada', class: 'status-scheduled', icon: '📅' },
      'no-show': { text: 'No Asistió', class: 'status-no-show', icon: '⚠️' }
    };
    
    const statusInfo = statusMap[status] || { text: status, class: 'status-default', icon: '📋' };
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.icon} {statusInfo.text}
      </span>
    );
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendar = [];
    const currentDateObj = new Date(startDate);

    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const dayAppointments = (appointments.length > 0 ? appointments : mockAppointments)
          .filter(apt => {
            const aptDate = new Date(apt.appointmentDate);
            return aptDate.toDateString() === currentDateObj.toDateString();
          });

        weekDays.push({
          date: new Date(currentDateObj),
          appointments: dayAppointments,
          isCurrentMonth: currentDateObj.getMonth() === month,
          isToday: currentDateObj.toDateString() === new Date().toDateString()
        });
        currentDateObj.setDate(currentDateObj.getDate() + 1);
      }
      calendar.push(weekDays);
    }
    return calendar;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const handleNewAppointment = () => {
    setShowNewAppointmentModal(true);
  };

  const handleCloseAppointmentModal = () => {
    setShowNewAppointmentModal(false);
    setNewAppointment({
      patientId: '',
      doctorId: '',
      appointmentDate: '',
      appointmentTime: '',
      type: 'consultation',
      notes: '',
      duration: 30
    });
  };

  const handleSaveAppointment = async () => {
    try {
      // Validate required fields
      if (!newAppointment.patientId || !newAppointment.doctorId || !newAppointment.appointmentDate || !newAppointment.appointmentTime) {
        alert('Por favor complete todos los campos requeridos');
        return;
      }

      // Combine date and time
      const appointmentDateTime = new Date(`${newAppointment.appointmentDate}T${newAppointment.appointmentTime}`);

      // Get patient and doctor names for display
      const patientNames = {
        '1': { firstName: 'Princess', lastName: 'Stretch' },
        '2': { firstName: 'Mehdi', lastName: "O'Keefe" },
        '3': { firstName: 'Ariane', lastName: 'McKenzie' },
        '4': { firstName: 'Lessie', lastName: 'Abbott' },
        '5': { firstName: 'Merle', lastName: 'Prosacco' }
      };

      const doctorNames = {
        '1': { firstName: 'Dr. Lura', lastName: 'Weimann' },
        '2': { firstName: 'Dr. Deshawn', lastName: 'Barton' },
        '3': { firstName: 'Dr. Pierce', lastName: "O'Conner" }
      };

      const newAppointmentData = {
        _id: Date.now().toString(),
        patient: patientNames[newAppointment.patientId],
        doctor: doctorNames[newAppointment.doctorId],
        appointmentDate: appointmentDateTime.toISOString(),
        type: newAppointment.type,
        status: 'scheduled',
        notes: newAppointment.notes,
        duration: newAppointment.duration
      };

      try {
        // TODO: Replace with actual API call
        const response = await fetch('/api/appointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(newAppointmentData)
        });

        if (response.ok) {
          alert('Cita creada exitosamente');
          handleCloseAppointmentModal();
          fetchAppointments(); // Refresh the list
          return;
        }
      } catch (apiError) {
        console.log('API not available, using demo mode');
      }

      // Demo mode: Add to local state
      setAppointments(prevAppointments => [...prevAppointments, newAppointmentData]);
      
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        pending: prevStats.pending + 1
      }));

      alert('Cita creada exitosamente (modo demo)');
      handleCloseAppointmentModal();
    } catch (error) {
      console.error('Error saving appointment:', error);
      alert('Error al crear la cita');
    }
  };

  const handleEditAppointment = (appointmentId) => {
    // TODO: Implement edit appointment functionality
    alert(`Editar cita ${appointmentId}`);
  };

  const handleDeleteAppointment = (appointmentId) => {
    // TODO: Implement delete appointment functionality
    if (window.confirm('¿Está seguro de que desea eliminar esta cita?')) {
      alert(`Cita ${appointmentId} eliminada`);
    }
  };

  return (
    <div className="appointments">
      <div className="page-header">
        <div className="header-content">
          <h1>{t('appointments.title')}</h1>
          <p>{t('appointments.subtitle')}</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={handleNewAppointment}>
            <span>➕</span>
            {t('appointments.newAppointment')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.todayAppointments}</h3>
            <p>{t('appointments.todayAppointments')}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.completed}</h3>
            <p>{t('appointments.completed')}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>{t('appointments.pending')}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <h3>{stats.cancelled}</h3>
            <p>{t('appointments.cancelled')}</p>
          </div>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="controls-section">
        <div className="search-filters">
          <input
            type="text"
            placeholder={t('appointments.searchPlaceholder')}
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
          <select 
            value={filters.status} 
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">{t('appointments.allStatuses')}</option>
            <option value="completed">{t('appointments.completed')}</option>
            <option value="pending">{t('appointments.pending')}</option>
            <option value="cancelled">{t('appointments.cancelled')}</option>
          </select>
          <select 
            value={filters.date} 
            onChange={(e) => setFilters({...filters, date: e.target.value})}
          >
            <option value="all">{t('appointments.allDates')}</option>
            <option value="today">{t('appointments.today')}</option>
            <option value="week">{t('appointments.thisWeek')}</option>
            <option value="month">{t('appointments.thisMonth')}</option>
          </select>
        </div>

        <div className="view-toggle">
          <button 
            className={`view-button ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            📋 {t('appointments.tableView')}
          </button>
          <button 
            className={`view-button ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            📅 {t('appointments.calendarView')}
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="calendar-section">
          <div className="calendar-header">
            <div className="calendar-nav">
              <button className="nav-button" onClick={() => navigateMonth(-1)}>‹</button>
              <h2 className="month-year">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
              <button className="nav-button" onClick={() => navigateMonth(1)}>›</button>
            </div>
            <button className="nav-button" onClick={() => setCurrentDate(new Date())}>
              {t('appointments.today')}
            </button>
          </div>

          <div className="calendar-grid">
            {dayNames.map(day => (
              <div key={day} className="calendar-day-header">{day}</div>
            ))}
            
            {generateCalendar().map((week, weekIndex) => 
              week.map((day, dayIndex) => (
                <div 
                  key={`${weekIndex}-${dayIndex}`} 
                  className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''}`}
                >
                  <div className="day-number">{day.date.getDate()}</div>
                  <div className="calendar-appointments">
                    {day.appointments.slice(0, 3).map((apt, aptIndex) => (
                      <div key={aptIndex} className={`calendar-appointment ${apt.status}`}>
                        <div className="appointment-time">
                          {new Date(apt.appointmentDate).toLocaleTimeString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        <div className="appointment-patient">
                          {apt.patient.firstName}
                        </div>
                      </div>
                    ))}
                    {day.appointments.length > 3 && (
                      <div className="more-appointments">
                        +{day.appointments.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Calendar Legend */}
          <div className="appointment-legend">
            <div className="legend-item">
              <span className="legend-color completed"></span>
              <span>{t('appointments.completed')}</span>
            </div>
            <div className="legend-item">
              <span className="legend-color pending"></span>
              <span>{t('appointments.pending')}</span>
            </div>
            <div className="legend-item">
              <span className="legend-color cancelled"></span>
              <span>{t('appointments.cancelled')}</span>
            </div>
            <div className="legend-item">
              <span className="legend-color no-show"></span>
              <span>No Asistió</span>
            </div>
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="appointments-table">
          <div className="table-header">
            <div className="col-patient">{t('appointments.patient')}</div>
            <div className="col-doctor">{t('appointments.doctor')}</div>
            <div className="col-date">{t('appointments.date')}</div>
            <div className="col-time">{t('appointments.time')}</div>
            <div className="col-type">{t('appointments.type')}</div>
            <div className="col-status">{t('appointments.status')}</div>
            <div className="col-actions">{t('appointments.actions')}</div>
          </div>

          <div className="table-body">
            {(appointments.length > 0 ? appointments : mockAppointments).map((appointment) => (
              <div key={appointment._id} className="table-row">
                <div className="col-patient">
                  <div className="patient-info">
                    <div className="patient-avatar">👤</div>
                    <div>
                      <h4>{appointment.patient.firstName} {appointment.patient.lastName}</h4>
                    </div>
                  </div>
                </div>

                <div className="col-doctor">
                  <p>{appointment.doctor.firstName} {appointment.doctor.lastName}</p>
                </div>

                <div className="col-date">
                  <p>{new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                </div>

                <div className="col-time">
                  <p>{new Date(appointment.appointmentDate).toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</p>
                </div>

                <div className="col-type">
                  <span className="type-badge">{appointment.type}</span>
                </div>

                <div className="col-status">
                  {getStatusBadge(appointment.status)}
                </div>

                <div className="col-actions">
                  <div className="action-buttons">
                    <button 
                      className="btn-action edit" 
                      onClick={() => handleEditAppointment(appointment._id)}
                      title="Editar cita"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-action delete" 
                      onClick={() => handleDeleteAppointment(appointment._id)}
                      title="Eliminar cita"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Appointment Modal */}
      {showNewAppointmentModal && (
        <div className="modal-overlay" onClick={handleCloseAppointmentModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nueva Cita</h2>
              <button className="modal-close" onClick={handleCloseAppointmentModal}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Paciente *</label>
                  <select
                    value={newAppointment.patientId}
                    onChange={(e) => setNewAppointment({...newAppointment, patientId: e.target.value})}
                  >
                    <option value="">Seleccionar paciente</option>
                    <option value="1">Princess Stretch</option>
                    <option value="2">Mehdi O'Keefe</option>
                    <option value="3">Ariane McKenzie</option>
                    <option value="4">Lessie Abbott</option>
                    <option value="5">Merle Prosacco</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Doctor *</label>
                  <select
                    value={newAppointment.doctorId}
                    onChange={(e) => setNewAppointment({...newAppointment, doctorId: e.target.value})}
                  >
                    <option value="">Seleccionar doctor</option>
                    <option value="1">Dr. Lura Weimann</option>
                    <option value="2">Dr. Deshawn Barton</option>
                    <option value="3">Dr. Pierce O'Conner</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Fecha *</label>
                  <input
                    type="date"
                    value={newAppointment.appointmentDate}
                    onChange={(e) => setNewAppointment({...newAppointment, appointmentDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="form-group">
                  <label>Hora *</label>
                  <input
                    type="time"
                    value={newAppointment.appointmentTime}
                    onChange={(e) => setNewAppointment({...newAppointment, appointmentTime: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Tipo de Cita</label>
                  <select
                    value={newAppointment.type}
                    onChange={(e) => setNewAppointment({...newAppointment, type: e.target.value})}
                  >
                    <option value="consultation">Consulta</option>
                    <option value="procedure">Procedimiento</option>
                    <option value="check-up">Revisión</option>
                    <option value="follow-up">Seguimiento</option>
                    <option value="emergency">Emergencia</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Duración (minutos)</label>
                  <select
                    value={newAppointment.duration}
                    onChange={(e) => setNewAppointment({...newAppointment, duration: parseInt(e.target.value)})}
                  >
                    <option value="15">15 minutos</option>
                    <option value="30">30 minutos</option>
                    <option value="45">45 minutos</option>
                    <option value="60">1 hora</option>
                    <option value="90">1.5 horas</option>
                    <option value="120">2 horas</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group full-width">
                <label>Notas</label>
                <textarea
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                  placeholder="Notas adicionales sobre la cita..."
                  rows="3"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleCloseAppointmentModal}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleSaveAppointment}>
                Crear Cita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
