const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const AIAnalysis = require('../models/AIAnalysis');
const Patient = require('../models/Patient');
const { auth, authorize, checkPermission } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/ai-analysis/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'xrayImage') {
      // Accept image files for X-ray analysis
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for X-ray analysis'));
      }
    } else if (file.fieldname === 'labReport') {
      // Accept PDF and image files for lab reports
      if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF and image files are allowed for lab reports'));
      }
    } else {
      cb(new Error('Invalid file field'));
    }
  }
});

// @route   GET /api/ai-analysis
// @desc    Get all AI analyses
// @access  Private
router.get('/', [auth, checkPermission('ai_analysis', 'read')], async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, patient } = req.query;
    const query = {};

    if (type) {
      query.analysisType = type;
    }

    if (status) {
      query.status = status;
    }

    if (patient) {
      query.patient = patient;
    }

    const analyses = await AIAnalysis.find(query)
      .populate('patient', 'firstName lastName patientId')
      .populate('doctor', 'firstName lastName')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AIAnalysis.countDocuments(query);

    res.json({
      analyses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get AI analyses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/ai-analysis/:id
// @desc    Get AI analysis by ID
// @access  Private
router.get('/:id', [auth, checkPermission('ai_analysis', 'read')], async (req, res) => {
  try {
    const analysis = await AIAnalysis.findById(req.params.id)
      .populate('patient')
      .populate('doctor', 'firstName lastName')
      .populate('reviewedBy', 'firstName lastName');

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Get AI analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/ai-analysis/xray
// @desc    Analyze X-ray image with AI
// @access  Private
router.post('/xray', [
  auth,
  checkPermission('ai_analysis', 'create'),
  upload.single('xrayImage'),
  body('patient').notEmpty().withMessage('Patient is required'),
  body('instructions').optional().isLength({ max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'X-ray image is required' });
    }

    // Create analysis record
    const analysis = new AIAnalysis({
      analysisType: 'xray',
      patient: req.body.patient,
      doctor: req.user.id,
      clinic: req.user.clinics[0],
      imageUrl: req.file.path,
      originalFilename: req.file.originalname,
      instructions: req.body.instructions,
      status: 'processing'
    });

    await analysis.save();

    // Simulate AI analysis (replace with actual AI service call)
    setTimeout(async () => {
      try {
        const aiResults = await simulateXrayAnalysis(req.file.path);
        
        await AIAnalysis.findByIdAndUpdate(analysis._id, {
          status: 'completed',
          results: aiResults,
          processedAt: new Date()
        });
      } catch (error) {
        console.error('AI analysis error:', error);
        await AIAnalysis.findByIdAndUpdate(analysis._id, {
          status: 'failed',
          error: error.message
        });
      }
    }, 5000); // Simulate 5 second processing time

    res.status(201).json({
      message: 'X-ray analysis started',
      analysis: {
        id: analysis._id,
        status: analysis.status,
        analysisType: analysis.analysisType
      }
    });
  } catch (error) {
    console.error('X-ray analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/ai-analysis/lab-report
// @desc    Analyze lab report with AI
// @access  Private
router.post('/lab-report', [
  auth,
  checkPermission('ai_analysis', 'create'),
  upload.single('labReport'),
  body('patient').notEmpty().withMessage('Patient is required'),
  body('reportType').notEmpty().withMessage('Report type is required'),
  body('instructions').optional().isLength({ max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Lab report file is required' });
    }

    // Create analysis record
    const analysis = new AIAnalysis({
      analysisType: 'lab_report',
      patient: req.body.patient,
      doctor: req.user.id,
      clinic: req.user.clinics[0],
      imageUrl: req.file.path,
      originalFilename: req.file.originalname,
      reportType: req.body.reportType,
      instructions: req.body.instructions,
      status: 'processing'
    });

    await analysis.save();

    // Simulate AI analysis (replace with actual AI service call)
    setTimeout(async () => {
      try {
        const aiResults = await simulateLabReportAnalysis(req.file.path, req.body.reportType);
        
        await AIAnalysis.findByIdAndUpdate(analysis._id, {
          status: 'completed',
          results: aiResults,
          processedAt: new Date()
        });
      } catch (error) {
        console.error('AI analysis error:', error);
        await AIAnalysis.findByIdAndUpdate(analysis._id, {
          status: 'failed',
          error: error.message
        });
      }
    }, 3000); // Simulate 3 second processing time

    res.status(201).json({
      message: 'Lab report analysis started',
      analysis: {
        id: analysis._id,
        status: analysis.status,
        analysisType: analysis.analysisType
      }
    });
  } catch (error) {
    console.error('Lab report analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/ai-analysis/compare
// @desc    Compare multiple test results
// @access  Private
router.post('/compare', [
  auth,
  checkPermission('ai_analysis', 'create'),
  body('patient').notEmpty().withMessage('Patient is required'),
  body('analysisIds').isArray({ min: 2 }).withMessage('At least 2 analyses are required for comparison'),
  body('comparisonType').isIn(['temporal', 'cross_reference']).withMessage('Valid comparison type is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify all analyses exist and belong to the patient
    const analyses = await AIAnalysis.find({
      _id: { $in: req.body.analysisIds },
      patient: req.body.patient,
      status: 'completed'
    });

    if (analyses.length !== req.body.analysisIds.length) {
      return res.status(400).json({ message: 'Some analyses not found or not completed' });
    }

    // Create comparison analysis
    const comparison = new AIAnalysis({
      analysisType: 'comparison',
      patient: req.body.patient,
      doctor: req.user.id,
      clinic: req.user.clinics[0],
      comparisonData: {
        type: req.body.comparisonType,
        analysisIds: req.body.analysisIds,
        notes: req.body.notes
      },
      status: 'processing'
    });

    await comparison.save();

    // Simulate AI comparison (replace with actual AI service call)
    setTimeout(async () => {
      try {
        const comparisonResults = await simulateComparisonAnalysis(analyses, req.body.comparisonType);
        
        await AIAnalysis.findByIdAndUpdate(comparison._id, {
          status: 'completed',
          results: comparisonResults,
          processedAt: new Date()
        });
      } catch (error) {
        console.error('AI comparison error:', error);
        await AIAnalysis.findByIdAndUpdate(comparison._id, {
          status: 'failed',
          error: error.message
        });
      }
    }, 4000); // Simulate 4 second processing time

    res.status(201).json({
      message: 'Comparison analysis started',
      analysis: {
        id: comparison._id,
        status: comparison.status,
        analysisType: comparison.analysisType
      }
    });
  } catch (error) {
    console.error('Comparison analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/ai-analysis/:id/review
// @desc    Review and approve/modify AI analysis
// @access  Private
router.put('/:id/review', [
  auth,
  checkPermission('ai_analysis', 'update'),
  body('action').isIn(['approve', 'modify', 'reject']).withMessage('Valid action is required'),
  body('doctorNotes').optional().isLength({ max: 2000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { action, doctorNotes, modifiedResults } = req.body;

    const updateData = {
      reviewStatus: action,
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      doctorNotes
    };

    if (action === 'modify' && modifiedResults) {
      updateData.modifiedResults = modifiedResults;
    }

    const analysis = await AIAnalysis.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('patient', 'firstName lastName')
     .populate('reviewedBy', 'firstName lastName');

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    res.json({
      message: `Analysis ${action}d successfully`,
      analysis
    });
  } catch (error) {
    console.error('Review analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/ai-analysis/stats/dashboard
// @desc    Get AI analysis statistics for dashboard
// @access  Private
router.get('/stats/dashboard', [auth, checkPermission('ai_analysis', 'read')], async (req, res) => {
  try {
    // Total analyses
    const totalAnalyses = await AIAnalysis.countDocuments();

    // Analyses by type
    const analysesByType = await AIAnalysis.aggregate([
      {
        $group: {
          _id: '$analysisType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Analyses by status
    const analysesByStatus = await AIAnalysis.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent analyses
    const recentAnalyses = await AIAnalysis.find()
      .populate('patient', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalAnalyses,
      analysesByType: analysesByType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      analysesByStatus: analysesByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentAnalyses
    });
  } catch (error) {
    console.error('Get AI analysis stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Simulation functions (replace with actual AI service calls)
async function simulateXrayAnalysis(imagePath) {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    findings: [
      {
        type: 'caries',
        location: 'Tooth 14 - Mesial surface',
        severity: 'moderate',
        confidence: 0.87
      },
      {
        type: 'bone_loss',
        location: 'Mandibular posterior region',
        severity: 'mild',
        confidence: 0.73
      }
    ],
    recommendations: [
      'Recommend composite filling for tooth 14',
      'Monitor bone loss progression',
      'Consider periodontal evaluation'
    ],
    overallAssessment: 'Moderate dental issues detected requiring treatment',
    confidenceScore: 0.82
  };
}

async function simulateLabReportAnalysis(reportPath, reportType) {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    extractedValues: [
      { parameter: 'Glucose', value: '95', unit: 'mg/dL', normalRange: '70-100', status: 'normal' },
      { parameter: 'Cholesterol', value: '180', unit: 'mg/dL', normalRange: '<200', status: 'normal' },
      { parameter: 'Hemoglobin', value: '14.2', unit: 'g/dL', normalRange: '12-16', status: 'normal' }
    ],
    abnormalFindings: [],
    recommendations: [
      'All values within normal range',
      'Continue current health regimen',
      'Recheck in 6 months'
    ],
    overallAssessment: 'Normal lab results',
    confidenceScore: 0.91
  };
}

async function simulateComparisonAnalysis(analyses, comparisonType) {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    comparisonType,
    trends: [
      {
        parameter: 'Overall Health Score',
        trend: 'improving',
        changePercent: 15,
        significance: 'moderate'
      }
    ],
    correlations: [
      {
        finding: 'Dental health improvement correlates with better lab values',
        confidence: 0.78
      }
    ],
    recommendations: [
      'Continue current treatment plan',
      'Monitor progress in 3 months'
    ],
    summary: 'Patient showing positive health trends across multiple assessments'
  };
}

module.exports = router;
