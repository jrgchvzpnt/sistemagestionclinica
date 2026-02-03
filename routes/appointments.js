const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const { auth, authorize, checkPermission } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/appointments
// @desc    Get all appointments
// @access  Private
router.get('/', [auth, checkPermission('appointments', 'read')], async (req, res) => {
  try {
    const { page = 1, limit = 10, date, status, doctor, patient } = req.query;
    const query = {};

    // Filter by date
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.appointmentDate = { $gte: startDate, $lt: endDate };
    }

    if (status) {
      query.status = status;
    }

    if (doctor) {
      query.doctor = doctor;
    }

    if (patient) {
      query.patient = patient;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName patientId phone')
      .populate('doctor', 'firstName lastName specialization')
      .populate('clinic', 'name')
      .sort({ appointmentDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Appointment.countDocuments(query);

    res.json({
      appointments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/appointments/calendar
// @desc    Get appointments for calendar view
// @access  Private
router.get('/calendar', [auth, checkPermission('appointments', 'read')], async (req, res) => {
  try {
    const { start, end } = req.query;
    
    const query = {
      appointmentDate: {
        $gte: new Date(start),
        $lte: new Date(end)
      }
    };

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .select('appointmentDate duration type reason status patient doctor notes');

    // Format for calendar
    const calendarEvents = appointments.map(apt => ({
      id: apt._id,
      title: `${apt.patient.firstName} ${apt.patient.lastName} - ${apt.type}`,
      start: apt.appointmentDate,
      end: new Date(apt.appointmentDate.getTime() + apt.duration * 60000),
      backgroundColor: getStatusColor(apt.status),
      extendedProps: {
        patient: apt.patient,
        doctor: apt.doctor,
        type: apt.type,
        reason: apt.reason,
        status: apt.status,
        notes: apt.notes
      }
    }));

    res.json(calendarEvents);
  } catch (error) {
    console.error('Get calendar appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get appointment by ID
// @access  Private
router.get('/:id', [auth, checkPermission('appointments', 'read')], async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient')
      .populate('doctor', 'firstName lastName specialization')
      .populate('clinic', 'name');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/appointments
// @desc    Create new appointment
// @access  Private
router.post('/', [
  auth,
  checkPermission('appointments', 'create'),
  body('patient').notEmpty().withMessage('Patient is required'),
  body('doctor').notEmpty().withMessage('Doctor is required'),
  body('appointmentDate').isISO8601().withMessage('Valid appointment date is required'),
  body('type').isIn(['consultation', 'follow-up', 'procedure', 'cleaning', 'emergency', 'checkup']).withMessage('Valid appointment type is required'),
  body('duration').isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check for scheduling conflicts
    const conflictingAppointment = await Appointment.findOne({
      doctor: req.body.doctor,
      appointmentDate: {
        $gte: new Date(req.body.appointmentDate),
        $lt: new Date(new Date(req.body.appointmentDate).getTime() + req.body.duration * 60000)
      },
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (conflictingAppointment) {
      return res.status(400).json({ message: 'Doctor is not available at this time' });
    }

    const appointment = new Appointment({
      ...req.body,
      clinic: req.user.clinics[0], // Assign to user's primary clinic
      createdBy: req.user.id
    });

    await appointment.save();

    // Populate the created appointment
    await appointment.populate('patient', 'firstName lastName phone email');
    await appointment.populate('doctor', 'firstName lastName');

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', [
  auth,
  checkPermission('appointments', 'update'),
  body('appointmentDate').optional().isISO8601(),
  body('type').optional().isIn(['consultation', 'follow-up', 'procedure', 'cleaning', 'emergency', 'checkup']),
  body('status').optional().isIn(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // If updating date/time, check for conflicts
    if (req.body.appointmentDate || req.body.duration) {
      const currentAppointment = await Appointment.findById(req.params.id);
      const newDate = req.body.appointmentDate || currentAppointment.appointmentDate;
      const newDuration = req.body.duration || currentAppointment.duration;

      const conflictingAppointment = await Appointment.findOne({
        _id: { $ne: req.params.id },
        doctor: req.body.doctor || currentAppointment.doctor,
        appointmentDate: {
          $gte: new Date(newDate),
          $lt: new Date(new Date(newDate).getTime() + newDuration * 60000)
        },
        status: { $in: ['scheduled', 'confirmed'] }
      });

      if (conflictingAppointment) {
        return res.status(400).json({ message: 'Doctor is not available at this time' });
      }
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('patient', 'firstName lastName')
     .populate('doctor', 'firstName lastName');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({
      message: 'Appointment updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Cancel appointment
// @access  Private
router.delete('/:id', [auth, checkPermission('appointments', 'delete')], async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'cancelled',
        cancellationReason: req.body.reason || 'Cancelled by staff',
        cancelledAt: new Date(),
        cancelledBy: req.user.id
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/appointments/stats/dashboard
// @desc    Get appointment statistics for dashboard
// @access  Private
router.get('/stats/dashboard', [auth, checkPermission('appointments', 'read')], async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's appointments
    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow }
    });

    // Appointments by status
    const appointmentsByStatus = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // This week's appointments
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const weeklyAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: weekStart, $lt: weekEnd }
    });

    res.json({
      todayAppointments,
      weeklyAppointments,
      appointmentsByStatus: appointmentsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to get status color for calendar
function getStatusColor(status) {
  const colors = {
    'scheduled': '#2196F3',
    'confirmed': '#4CAF50',
    'in-progress': '#FF9800',
    'completed': '#8BC34A',
    'cancelled': '#F44336',
    'no-show': '#9E9E9E'
  };
  return colors[status] || '#2196F3';
}

module.exports = router;
