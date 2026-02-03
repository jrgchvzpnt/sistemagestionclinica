const express = require('express');
const { body, validationResult } = require('express-validator');
const Patient = require('../models/Patient');
const { auth, authorize, checkPermission } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/patients
// @desc    Get all patients
// @access  Private
router.get('/', [auth, checkPermission('patients', 'read')], async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const query = {};

    // Add search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.isActive = status === 'active';
    }

    const patients = await Patient.find(query)
      .populate('clinic', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Patient.countDocuments(query);

    res.json({
      patients,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/patients/:id
// @desc    Get patient by ID
// @access  Private
router.get('/:id', [auth, checkPermission('patients', 'read')], async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('clinic', 'name')
      .populate('appointments')
      .populate('prescriptions');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/patients
// @desc    Create new patient
// @access  Private
router.post('/', [
  auth,
  checkPermission('patients', 'create'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if patient already exists
    const existingPatient = await Patient.findOne({ email: req.body.email });
    if (existingPatient) {
      return res.status(400).json({ message: 'Patient already exists with this email' });
    }

    const patient = new Patient({
      ...req.body,
      clinic: req.user.clinics[0] // Assign to user's primary clinic
    });

    await patient.save();

    res.status(201).json({
      message: 'Patient created successfully',
      patient
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/patients/:id
// @desc    Update patient
// @access  Private
router.put('/:id', [
  auth,
  checkPermission('patients', 'update'),
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({
      message: 'Patient updated successfully',
      patient
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/patients/:id
// @desc    Delete patient (soft delete)
// @access  Private
router.delete('/:id', [auth, checkPermission('patients', 'delete')], async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/patients/:id/medical-history
// @desc    Get patient medical history
// @access  Private
router.get('/:id/medical-history', [auth, checkPermission('patients', 'read')], async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .select('medicalHistory dentalHistory allergies medications conditions');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    console.error('Get medical history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/patients/:id/medical-history
// @desc    Update patient medical history
// @access  Private
router.put('/:id/medical-history', [
  auth,
  checkPermission('patients', 'update')
], async (req, res) => {
  try {
    const { medicalHistory, dentalHistory, allergies, medications, conditions } = req.body;

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        medicalHistory,
        dentalHistory,
        allergies,
        medications,
        conditions,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({
      message: 'Medical history updated successfully',
      patient
    });
  } catch (error) {
    console.error('Update medical history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
