const express = require('express');
const { body, validationResult } = require('express-validator');
const Prospect = require('../models/Prospect');
const { auth, authorize, checkPermission } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/prospects
// @desc    Get all prospects
// @access  Private
router.get('/', [auth, checkPermission('prospects', 'read')], async (req, res) => {
  try {
    const { page = 1, limit = 10, status, source, assignedTo } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (source) {
      query.source = source;
    }

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    const prospects = await Prospect.find(query)
      .populate('assignedTo', 'firstName lastName')
      .populate('clinic', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Prospect.countDocuments(query);

    res.json({
      prospects,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get prospects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/prospects/:id
// @desc    Get prospect by ID
// @access  Private
router.get('/:id', [auth, checkPermission('prospects', 'read')], async (req, res) => {
  try {
    const prospect = await Prospect.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName')
      .populate('clinic', 'name');

    if (!prospect) {
      return res.status(404).json({ message: 'Prospect not found' });
    }

    res.json(prospect);
  } catch (error) {
    console.error('Get prospect error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/prospects
// @desc    Create new prospect
// @access  Private
router.post('/', [
  auth,
  checkPermission('prospects', 'create'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('source').isIn(['social', 'advertisement', 'walk-in', 'referral', 'website']).withMessage('Valid source is required'),
  body('serviceInterest').notEmpty().withMessage('Service interest is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if prospect already exists
    const existingProspect = await Prospect.findOne({ 
      email: req.body.email,
      status: { $ne: 'converted' }
    });
    
    if (existingProspect) {
      return res.status(400).json({ message: 'Prospect already exists with this email' });
    }

    const prospect = new Prospect({
      ...req.body,
      clinic: req.user.clinics[0],
      assignedTo: req.body.assignedTo || req.user.id
    });

    await prospect.save();

    // Populate the created prospect
    await prospect.populate('assignedTo', 'firstName lastName');

    res.status(201).json({
      message: 'Prospect created successfully',
      prospect
    });
  } catch (error) {
    console.error('Create prospect error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/prospects/:id
// @desc    Update prospect
// @access  Private
router.put('/:id', [
  auth,
  checkPermission('prospects', 'update'),
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  body('status').optional().isIn(['new', 'contacted', 'qualified', 'converted', 'lost'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const prospect = await Prospect.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'firstName lastName');

    if (!prospect) {
      return res.status(404).json({ message: 'Prospect not found' });
    }

    res.json({
      message: 'Prospect updated successfully',
      prospect
    });
  } catch (error) {
    console.error('Update prospect error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/prospects/:id
// @desc    Delete prospect
// @access  Private
router.delete('/:id', [auth, checkPermission('prospects', 'delete')], async (req, res) => {
  try {
    const prospect = await Prospect.findByIdAndDelete(req.params.id);

    if (!prospect) {
      return res.status(404).json({ message: 'Prospect not found' });
    }

    res.json({ message: 'Prospect deleted successfully' });
  } catch (error) {
    console.error('Delete prospect error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/prospects/:id/notes
// @desc    Add note to prospect
// @access  Private
router.post('/:id/notes', [
  auth,
  checkPermission('prospects', 'update'),
  body('content').notEmpty().withMessage('Note content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const prospect = await Prospect.findById(req.params.id);
    if (!prospect) {
      return res.status(404).json({ message: 'Prospect not found' });
    }

    const note = {
      content: req.body.content,
      createdBy: req.user.id,
      createdAt: new Date()
    };

    prospect.notes.push(note);
    await prospect.save();

    res.json({
      message: 'Note added successfully',
      note
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/prospects/:id/convert
// @desc    Convert prospect to patient
// @access  Private
router.post('/:id/convert', [
  auth,
  checkPermission('prospects', 'update'),
  checkPermission('patients', 'create')
], async (req, res) => {
  try {
    const prospect = await Prospect.findById(req.params.id);
    if (!prospect) {
      return res.status(404).json({ message: 'Prospect not found' });
    }

    if (prospect.status === 'converted') {
      return res.status(400).json({ message: 'Prospect already converted' });
    }

    // Create patient from prospect data
    const Patient = require('../models/Patient');
    const patient = new Patient({
      firstName: prospect.firstName,
      lastName: prospect.lastName,
      email: prospect.email,
      phone: prospect.phone,
      dateOfBirth: prospect.dateOfBirth,
      gender: prospect.gender,
      address: prospect.address,
      clinic: prospect.clinic,
      source: 'prospect_conversion',
      notes: `Converted from prospect. Original source: ${prospect.source}`
    });

    await patient.save();

    // Update prospect status
    prospect.status = 'converted';
    prospect.convertedAt = new Date();
    prospect.convertedTo = patient._id;
    await prospect.save();

    res.json({
      message: 'Prospect converted to patient successfully',
      patient,
      prospect
    });
  } catch (error) {
    console.error('Convert prospect error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/prospects/stats/dashboard
// @desc    Get prospect statistics for dashboard
// @access  Private
router.get('/stats/dashboard', [auth, checkPermission('prospects', 'read')], async (req, res) => {
  try {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Total prospects
    const totalProspects = await Prospect.countDocuments();

    // New prospects this month
    const newProspects = await Prospect.countDocuments({
      createdAt: { $gte: thisMonth }
    });

    // Converted prospects this month
    const convertedProspects = await Prospect.countDocuments({
      status: 'converted',
      convertedAt: { $gte: thisMonth }
    });

    // Conversion rate
    const conversionRate = totalProspects > 0 
      ? ((convertedProspects / totalProspects) * 100).toFixed(2)
      : 0;

    // Prospects by status
    const prospectsByStatus = await Prospect.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Prospects by source
    const prospectsBySource = await Prospect.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalProspects,
      newProspects,
      convertedProspects,
      conversionRate: parseFloat(conversionRate),
      prospectsByStatus: prospectsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      prospectsBySource: prospectsBySource.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Get prospect stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
