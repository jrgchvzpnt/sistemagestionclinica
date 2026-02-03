const express = require('express');
const { body, validationResult } = require('express-validator');
const Odontogram = require('../models/Odontogram');
const Patient = require('../models/Patient');
const { auth, authorize, checkPermission } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/odontograms
// @desc    Get all odontograms
// @access  Private
router.get('/', [auth, checkPermission('odontograms', 'read')], async (req, res) => {
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

    const odontograms = await Odontogram.find(query)
      .populate('patient', 'firstName lastName patientId')
      .populate('doctor', 'firstName lastName')
      .populate('clinic', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Odontogram.countDocuments(query);

    res.json({
      odontograms,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get odontograms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/odontograms/:id
// @desc    Get odontogram by ID
// @access  Private
router.get('/:id', [auth, checkPermission('odontograms', 'read')], async (req, res) => {
  try {
    const odontogram = await Odontogram.findById(req.params.id)
      .populate('patient')
      .populate('doctor', 'firstName lastName')
      .populate('clinic', 'name');

    if (!odontogram) {
      return res.status(404).json({ message: 'Odontogram not found' });
    }

    res.json(odontogram);
  } catch (error) {
    console.error('Get odontogram error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/odontograms
// @desc    Create new odontogram
// @access  Private
router.post('/', [
  auth,
  checkPermission('odontograms', 'create'),
  body('patient').notEmpty().withMessage('Patient is required'),
  body('teethData').isArray().withMessage('Teeth data must be an array'),
  body('version').notEmpty().withMessage('Version is required')
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

    const odontogram = new Odontogram({
      ...req.body,
      doctor: req.user.id,
      clinic: req.user.clinics[0]
    });

    await odontogram.save();

    // Populate the created odontogram
    await odontogram.populate('patient', 'firstName lastName');
    await odontogram.populate('doctor', 'firstName lastName');

    res.status(201).json({
      message: 'Odontogram created successfully',
      odontogram
    });
  } catch (error) {
    console.error('Create odontogram error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/odontograms/:id
// @desc    Update odontogram
// @access  Private
router.put('/:id', [
  auth,
  checkPermission('odontograms', 'update'),
  body('teethData').optional().isArray(),
  body('status').optional().isIn(['active', 'completed', 'archived'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const odontogram = await Odontogram.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('patient', 'firstName lastName')
     .populate('doctor', 'firstName lastName');

    if (!odontogram) {
      return res.status(404).json({ message: 'Odontogram not found' });
    }

    res.json({
      message: 'Odontogram updated successfully',
      odontogram
    });
  } catch (error) {
    console.error('Update odontogram error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/odontograms/:id
// @desc    Delete odontogram
// @access  Private
router.delete('/:id', [auth, checkPermission('odontograms', 'delete')], async (req, res) => {
  try {
    const odontogram = await Odontogram.findByIdAndUpdate(
      req.params.id,
      { status: 'archived' },
      { new: true }
    );

    if (!odontogram) {
      return res.status(404).json({ message: 'Odontogram not found' });
    }

    res.json({ message: 'Odontogram archived successfully' });
  } catch (error) {
    console.error('Delete odontogram error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/odontograms/patient/:patientId
// @desc    Get all odontograms for a patient
// @access  Private
router.get('/patient/:patientId', [auth, checkPermission('odontograms', 'read')], async (req, res) => {
  try {
    const odontograms = await Odontogram.find({ 
      patient: req.params.patientId,
      status: { $ne: 'archived' }
    })
      .populate('doctor', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(odontograms);
  } catch (error) {
    console.error('Get patient odontograms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/odontograms/:id/treatment-plan
// @desc    Add treatment plan to odontogram
// @access  Private
router.post('/:id/treatment-plan', [
  auth,
  checkPermission('odontograms', 'update'),
  body('treatments').isArray().withMessage('Treatments must be an array'),
  body('treatments.*.tooth').notEmpty().withMessage('Tooth number is required'),
  body('treatments.*.procedure').notEmpty().withMessage('Procedure is required'),
  body('treatments.*.priority').isIn(['urgent', 'high', 'medium', 'low']).withMessage('Valid priority is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const odontogram = await Odontogram.findByIdAndUpdate(
      req.params.id,
      { 
        treatmentPlan: req.body.treatments,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).populate('patient', 'firstName lastName')
     .populate('doctor', 'firstName lastName');

    if (!odontogram) {
      return res.status(404).json({ message: 'Odontogram not found' });
    }

    res.json({
      message: 'Treatment plan added successfully',
      odontogram
    });
  } catch (error) {
    console.error('Add treatment plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/odontograms/:id/treatment/:treatmentId
// @desc    Update treatment status
// @access  Private
router.put('/:id/treatment/:treatmentId', [
  auth,
  checkPermission('odontograms', 'update'),
  body('status').isIn(['planned', 'in-progress', 'completed', 'cancelled']).withMessage('Valid status is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const odontogram = await Odontogram.findById(req.params.id);
    if (!odontogram) {
      return res.status(404).json({ message: 'Odontogram not found' });
    }

    const treatment = odontogram.treatmentPlan.id(req.params.treatmentId);
    if (!treatment) {
      return res.status(404).json({ message: 'Treatment not found' });
    }

    treatment.status = req.body.status;
    if (req.body.status === 'completed') {
      treatment.completedAt = new Date();
      treatment.completedBy = req.user.id;
    }

    await odontogram.save();

    res.json({
      message: 'Treatment status updated successfully',
      treatment
    });
  } catch (error) {
    console.error('Update treatment status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/odontograms/stats/dashboard
// @desc    Get odontogram statistics for dashboard
// @access  Private
router.get('/stats/dashboard', [auth, checkPermission('odontograms', 'read')], async (req, res) => {
  try {
    // Total odontograms
    const totalOdontograms = await Odontogram.countDocuments({ status: { $ne: 'archived' } });

    // Active treatments
    const activeTreatments = await Odontogram.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$treatmentPlan' },
      { $match: { 'treatmentPlan.status': { $in: ['planned', 'in-progress'] } } },
      { $count: 'total' }
    ]);

    // Completion rate
    const completionStats = await Odontogram.aggregate([
      { $unwind: '$treatmentPlan' },
      {
        $group: {
          _id: '$treatmentPlan.status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Revenue estimate
    const revenueEstimate = await Odontogram.aggregate([
      { $unwind: '$treatmentPlan' },
      { $match: { 'treatmentPlan.status': { $ne: 'cancelled' } } },
      {
        $group: {
          _id: null,
          total: { $sum: '$treatmentPlan.estimatedCost' }
        }
      }
    ]);

    res.json({
      totalOdontograms,
      activeTreatments: activeTreatments[0]?.total || 0,
      completionStats: completionStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      estimatedRevenue: revenueEstimate[0]?.total || 0
    });
  } catch (error) {
    console.error('Get odontogram stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
