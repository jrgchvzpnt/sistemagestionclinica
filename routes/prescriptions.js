const express = require('express');
const { body, validationResult } = require('express-validator');
const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const { auth, authorize, checkPermission } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/prescriptions
// @desc    Get all prescriptions
// @access  Private
router.get('/', [auth, checkPermission('prescriptions', 'read')], async (req, res) => {
  try {
    const { page = 1, limit = 10, patient, doctor, status } = req.query;
    const query = {};

    if (patient) {
      query.patient = patient;
    }

    if (doctor) {
      query.doctor = doctor;
    }

    if (status) {
      query.status = status;
    }

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'firstName lastName patientId')
      .populate('doctor', 'firstName lastName')
      .populate('clinic', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Prescription.countDocuments(query);

    res.json({
      prescriptions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/prescriptions/:id
// @desc    Get prescription by ID
// @access  Private
router.get('/:id', [auth, checkPermission('prescriptions', 'read')], async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient')
      .populate('doctor', 'firstName lastName')
      .populate('clinic', 'name');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json(prescription);
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/prescriptions
// @desc    Create new prescription
// @access  Private
router.post('/', [
  auth,
  checkPermission('prescriptions', 'create'),
  body('patient').notEmpty().withMessage('Patient is required'),
  body('medications').isArray({ min: 1 }).withMessage('At least one medication is required'),
  body('medications.*.name').notEmpty().withMessage('Medication name is required'),
  body('medications.*.dosage').notEmpty().withMessage('Dosage is required'),
  body('medications.*.frequency').notEmpty().withMessage('Frequency is required'),
  body('medications.*.duration').notEmpty().withMessage('Duration is required'),
  body('diagnosis').notEmpty().withMessage('Diagnosis is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify patient exists
    const patient = await Patient.findById(req.body.patient);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const prescription = new Prescription({
      ...req.body,
      doctor: req.user.id,
      clinic: req.user.clinics[0],
      prescriptionId: generatePrescriptionId()
    });

    await prescription.save();

    // Populate the created prescription
    await prescription.populate('patient', 'firstName lastName');
    await prescription.populate('doctor', 'firstName lastName');

    res.status(201).json({
      message: 'Prescription created successfully',
      prescription
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/prescriptions/:id
// @desc    Update prescription
// @access  Private
router.put('/:id', [
  auth,
  checkPermission('prescriptions', 'update'),
  body('medications').optional().isArray(),
  body('status').optional().isIn(['active', 'completed', 'cancelled', 'pending'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('patient', 'firstName lastName')
     .populate('doctor', 'firstName lastName');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json({
      message: 'Prescription updated successfully',
      prescription
    });
  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/prescriptions/:id
// @desc    Cancel prescription
// @access  Private
router.delete('/:id', [auth, checkPermission('prescriptions', 'delete')], async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy: req.user.id,
        cancellationReason: req.body.reason || 'Cancelled by doctor'
      },
      { new: true }
    );

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json({ message: 'Prescription cancelled successfully' });
  } catch (error) {
    console.error('Cancel prescription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/prescriptions/patient/:patientId
// @desc    Get all prescriptions for a patient
// @access  Private
router.get('/patient/:patientId', [auth, checkPermission('prescriptions', 'read')], async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ 
      patient: req.params.patientId,
      status: { $ne: 'cancelled' }
    })
      .populate('doctor', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    console.error('Get patient prescriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/prescriptions/:id/refill
// @desc    Request prescription refill
// @access  Private
router.post('/:id/refill', [
  auth,
  checkPermission('prescriptions', 'create'),
  body('reason').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const originalPrescription = await Prescription.findById(req.params.id)
      .populate('patient')
      .populate('doctor', 'firstName lastName');

    if (!originalPrescription) {
      return res.status(404).json({ message: 'Original prescription not found' });
    }

    if (originalPrescription.status !== 'completed') {
      return res.status(400).json({ message: 'Can only refill completed prescriptions' });
    }

    // Create new prescription based on original
    const refillPrescription = new Prescription({
      patient: originalPrescription.patient._id,
      doctor: req.user.id,
      clinic: originalPrescription.clinic,
      medications: originalPrescription.medications,
      diagnosis: originalPrescription.diagnosis,
      notes: `Refill of prescription ${originalPrescription.prescriptionId}. ${req.body.reason || ''}`,
      prescriptionId: generatePrescriptionId(),
      isRefill: true,
      originalPrescription: originalPrescription._id
    });

    await refillPrescription.save();

    // Populate the created prescription
    await refillPrescription.populate('patient', 'firstName lastName');
    await refillPrescription.populate('doctor', 'firstName lastName');

    res.status(201).json({
      message: 'Prescription refill created successfully',
      prescription: refillPrescription
    });
  } catch (error) {
    console.error('Create refill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/prescriptions/:id/dispense
// @desc    Mark prescription as dispensed
// @access  Private
router.put('/:id/dispense', [
  auth,
  checkPermission('prescriptions', 'update'),
  body('dispensedBy').notEmpty().withMessage('Dispensed by is required'),
  body('dispensedAt').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      {
        status: 'completed',
        dispensedBy: req.body.dispensedBy,
        dispensedAt: req.body.dispensedAt || new Date(),
        dispensingNotes: req.body.notes
      },
      { new: true, runValidators: true }
    ).populate('patient', 'firstName lastName')
     .populate('doctor', 'firstName lastName');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json({
      message: 'Prescription marked as dispensed',
      prescription
    });
  } catch (error) {
    console.error('Dispense prescription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/prescriptions/stats/dashboard
// @desc    Get prescription statistics for dashboard
// @access  Private
router.get('/stats/dashboard', [auth, checkPermission('prescriptions', 'read')], async (req, res) => {
  try {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Total prescriptions
    const totalPrescriptions = await Prescription.countDocuments();

    // Active prescriptions
    const activePrescriptions = await Prescription.countDocuments({ status: 'active' });

    // Pending prescriptions
    const pendingPrescriptions = await Prescription.countDocuments({ status: 'pending' });

    // Prescriptions this month
    const monthlyPrescriptions = await Prescription.countDocuments({
      createdAt: { $gte: thisMonth }
    });

    // Prescriptions by status
    const prescriptionsByStatus = await Prescription.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Most prescribed medications
    const topMedications = await Prescription.aggregate([
      { $unwind: '$medications' },
      {
        $group: {
          _id: '$medications.name',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Refill rate
    const refillCount = await Prescription.countDocuments({ isRefill: true });
    const refillRate = totalPrescriptions > 0 
      ? ((refillCount / totalPrescriptions) * 100).toFixed(2)
      : 0;

    res.json({
      totalPrescriptions,
      activePrescriptions,
      pendingPrescriptions,
      monthlyPrescriptions,
      refillRate: parseFloat(refillRate),
      prescriptionsByStatus: prescriptionsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      topMedications
    });
  } catch (error) {
    console.error('Get prescription stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to generate prescription ID
function generatePrescriptionId() {
  const prefix = 'RX';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

module.exports = router;
