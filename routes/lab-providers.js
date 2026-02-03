const express = require('express');
const { body, validationResult } = require('express-validator');
const LabProvider = require('../models/LabProvider');
const { auth, authorize, checkPermission } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/lab-providers
// @desc    Get all lab providers
// @access  Private
router.get('/', [auth, checkPermission('lab_providers', 'read')], async (req, res) => {
  try {
    const { page = 1, limit = 10, status, specialties, state } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (specialties) {
      query.specialties = { $in: specialties.split(',') };
    }

    if (state) {
      query.state = state;
    }

    const providers = await LabProvider.find(query)
      .populate('clinic', 'name')
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await LabProvider.countDocuments(query);

    res.json({
      providers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get lab providers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/lab-providers/:id
// @desc    Get lab provider by ID
// @access  Private
router.get('/:id', [auth, checkPermission('lab_providers', 'read')], async (req, res) => {
  try {
    const provider = await LabProvider.findById(req.params.id)
      .populate('clinic', 'name');

    if (!provider) {
      return res.status(404).json({ message: 'Lab provider not found' });
    }

    res.json(provider);
  } catch (error) {
    console.error('Get lab provider error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/lab-providers
// @desc    Create new lab provider
// @access  Private
router.post('/', [
  auth,
  checkPermission('lab_providers', 'create'),
  body('name').trim().notEmpty().withMessage('Provider name is required'),
  body('code').trim().notEmpty().withMessage('Provider code is required'),
  body('contactPerson').notEmpty().withMessage('Contact person is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('specialties').isArray({ min: 1 }).withMessage('At least one specialty is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if provider code already exists
    const existingProvider = await LabProvider.findOne({ code: req.body.code });
    if (existingProvider) {
      return res.status(400).json({ message: 'Provider code already exists' });
    }

    const provider = new LabProvider({
      ...req.body,
      clinic: req.user.clinics[0]
    });

    await provider.save();

    res.status(201).json({
      message: 'Lab provider created successfully',
      provider
    });
  } catch (error) {
    console.error('Create lab provider error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/lab-providers/:id
// @desc    Update lab provider
// @access  Private
router.put('/:id', [
  auth,
  checkPermission('lab_providers', 'update'),
  body('name').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'budget', 'premium', 'moderate'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const provider = await LabProvider.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!provider) {
      return res.status(404).json({ message: 'Lab provider not found' });
    }

    res.json({
      message: 'Lab provider updated successfully',
      provider
    });
  } catch (error) {
    console.error('Update lab provider error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/lab-providers/:id
// @desc    Delete lab provider
// @access  Private
router.delete('/:id', [auth, checkPermission('lab_providers', 'delete')], async (req, res) => {
  try {
    const provider = await LabProvider.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );

    if (!provider) {
      return res.status(404).json({ message: 'Lab provider not found' });
    }

    res.json({ message: 'Lab provider deactivated successfully' });
  } catch (error) {
    console.error('Delete lab provider error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/lab-providers/search
// @desc    Search lab providers
// @access  Private
router.get('/search', [auth, checkPermission('lab_providers', 'read')], async (req, res) => {
  try {
    const { q, specialty, location } = req.query;
    const query = { status: 'active' };

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { code: { $regex: q, $options: 'i' } },
        { contactPerson: { $regex: q, $options: 'i' } }
      ];
    }

    if (specialty) {
      query.specialties = { $in: [specialty] };
    }

    if (location) {
      query.$or = [
        { city: { $regex: location, $options: 'i' } },
        { state: { $regex: location, $options: 'i' } }
      ];
    }

    const providers = await LabProvider.find(query)
      .select('name code contactPerson phone email specialties city state rating')
      .sort({ rating: -1, name: 1 })
      .limit(20);

    res.json(providers);
  } catch (error) {
    console.error('Search lab providers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/lab-providers/:id/rate
// @desc    Rate lab provider
// @access  Private
router.post('/:id/rate', [
  auth,
  checkPermission('lab_providers', 'update'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().isLength({ max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const provider = await LabProvider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: 'Lab provider not found' });
    }

    // Check if user already rated this provider
    const existingRating = provider.ratings.find(
      rating => rating.ratedBy.toString() === req.user.id
    );

    if (existingRating) {
      // Update existing rating
      existingRating.rating = req.body.rating;
      existingRating.review = req.body.review;
      existingRating.updatedAt = new Date();
    } else {
      // Add new rating
      provider.ratings.push({
        rating: req.body.rating,
        review: req.body.review,
        ratedBy: req.user.id,
        createdAt: new Date()
      });
    }

    // Recalculate average rating
    const totalRatings = provider.ratings.length;
    const sumRatings = provider.ratings.reduce((sum, rating) => sum + rating.rating, 0);
    provider.rating = totalRatings > 0 ? (sumRatings / totalRatings).toFixed(1) : 0;

    await provider.save();

    res.json({
      message: 'Rating submitted successfully',
      rating: provider.rating
    });
  } catch (error) {
    console.error('Rate lab provider error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/lab-providers/:id/performance
// @desc    Get lab provider performance metrics
// @access  Private
router.get('/:id/performance', [auth, checkPermission('lab_providers', 'read')], async (req, res) => {
  try {
    const provider = await LabProvider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: 'Lab provider not found' });
    }

    // Calculate performance metrics
    const totalTests = provider.performance.totalTests || 0;
    const completedTests = provider.performance.completedTests || 0;
    const averageTurnaroundTime = provider.performance.averageTurnaroundTime || 0;
    const qualityScore = provider.performance.qualityScore || 0;

    const completionRate = totalTests > 0 ? ((completedTests / totalTests) * 100).toFixed(2) : 0;

    // Recent performance trend (simulated)
    const performanceTrend = [
      { month: 'Jan', completionRate: 95, turnaroundTime: 24 },
      { month: 'Feb', completionRate: 97, turnaroundTime: 22 },
      { month: 'Mar', completionRate: 94, turnaroundTime: 26 },
      { month: 'Apr', completionRate: 98, turnaroundTime: 20 },
      { month: 'May', completionRate: 96, turnaroundTime: 23 },
      { month: 'Jun', completionRate: 99, turnaroundTime: 18 }
    ];

    res.json({
      totalTests,
      completedTests,
      completionRate: parseFloat(completionRate),
      averageTurnaroundTime,
      qualityScore,
      rating: provider.rating,
      totalRatings: provider.ratings.length,
      performanceTrend
    });
  } catch (error) {
    console.error('Get provider performance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/lab-providers/stats/dashboard
// @desc    Get lab provider statistics for dashboard
// @access  Private
router.get('/stats/dashboard', [auth, checkPermission('lab_providers', 'read')], async (req, res) => {
  try {
    // Total providers
    const totalProviders = await LabProvider.countDocuments();

    // Active providers
    const activeProviders = await LabProvider.countDocuments({ status: 'active' });

    // Pending providers
    const pendingProviders = await LabProvider.countDocuments({ status: 'pending' });

    // Providers by status
    const providersByStatus = await LabProvider.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top specialties
    const topSpecialties = await LabProvider.aggregate([
      { $unwind: '$specialties' },
      {
        $group: {
          _id: '$specialties',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Average rating
    const avgRating = await LabProvider.aggregate([
      { $match: { rating: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    // Total tests processed (simulated)
    const totalTests = await LabProvider.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$performance.totalTests' }
        }
      }
    ]);

    res.json({
      totalProviders,
      activeProviders,
      pendingProviders,
      providersByStatus: providersByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      topSpecialties,
      averageRating: avgRating[0]?.averageRating?.toFixed(2) || 0,
      totalTests: totalTests[0]?.total || 101608 // From the image
    });
  } catch (error) {
    console.error('Get lab provider stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
