const express = require('express');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const AIAnalysis = require('../models/AIAnalysis');
const Odontogram = require('../models/Odontogram');
const Prospect = require('../models/Prospect');
const Prescription = require('../models/Prescription');
const { auth, authorize, checkPermission } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', [auth], async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    // Today's appointments
    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow },
      status: { $ne: 'cancelled' }
    });

    // Total patients
    const totalPatients = await Patient.countDocuments({ isActive: true });

    // Monthly revenue (simulated - would come from billing system)
    const monthlyRevenue = await calculateMonthlyRevenue(thisMonth, nextMonth);

    // Low stock items (simulated)
    const lowStockItems = 0; // Would come from inventory system

    // Recent appointments
    const recentAppointments = await Appointment.find({
      appointmentDate: { $gte: today }
    })
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .sort({ appointmentDate: 1 })
      .limit(5);

    // Recent leads/prospects
    const recentLeads = await Prospect.find()
      .populate('assignedTo', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    // Appointment status distribution
    const appointmentsByStatus = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: thisMonth, $lt: nextMonth }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // AI Analysis stats
    const aiAnalysisStats = await AIAnalysis.aggregate([
      {
        $match: {
          createdAt: { $gte: thisMonth, $lt: nextMonth }
        }
      },
      {
        $group: {
          _id: '$analysisType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Revenue trend (last 6 months)
    const revenueTrend = await getRevenueTrend();

    res.json({
      todayAppointments,
      totalPatients,
      monthlyRevenue,
      lowStockItems,
      recentAppointments,
      recentLeads,
      appointmentsByStatus: appointmentsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      aiAnalysisStats: aiAnalysisStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      revenueTrend
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/appointments-today
// @desc    Get today's appointments
// @access  Private
router.get('/appointments-today', [auth, checkPermission('appointments', 'read')], async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({
      appointmentDate: { $gte: today, $lt: tomorrow }
    })
      .populate('patient', 'firstName lastName phone')
      .populate('doctor', 'firstName lastName')
      .sort({ appointmentDate: 1 });

    res.json(appointments);
  } catch (error) {
    console.error('Get today appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/revenue-summary
// @desc    Get revenue summary
// @access  Private
router.get('/revenue-summary', [auth, checkPermission('billing', 'read')], async (req, res) => {
  try {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const thisYear = new Date(today.getFullYear(), 0, 1);

    // Simulated revenue data (would come from actual billing system)
    const monthlyRevenue = await calculateMonthlyRevenue(thisMonth, new Date());
    const lastMonthRevenue = await calculateMonthlyRevenue(lastMonth, thisMonth);
    const yearlyRevenue = await calculateMonthlyRevenue(thisYear, new Date());

    const monthlyGrowth = lastMonthRevenue > 0 
      ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(2)
      : 0;

    res.json({
      monthlyRevenue,
      lastMonthRevenue,
      yearlyRevenue,
      monthlyGrowth: parseFloat(monthlyGrowth),
      currency: 'USD'
    });
  } catch (error) {
    console.error('Get revenue summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/patient-stats
// @desc    Get patient statistics
// @access  Private
router.get('/patient-stats', [auth, checkPermission('patients', 'read')], async (req, res) => {
  try {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    // Total active patients
    const totalPatients = await Patient.countDocuments({ isActive: true });

    // New patients this month
    const newPatientsThisMonth = await Patient.countDocuments({
      createdAt: { $gte: thisMonth },
      isActive: true
    });

    // New patients last month
    const newPatientsLastMonth = await Patient.countDocuments({
      createdAt: { $gte: lastMonth, $lt: thisMonth },
      isActive: true
    });

    // Patient age distribution
    const ageDistribution = await Patient.aggregate([
      { $match: { isActive: true } },
      {
        $addFields: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$dateOfBirth'] },
                365.25 * 24 * 60 * 60 * 1000
              ]
            }
          }
        }
      },
      {
        $bucket: {
          groupBy: '$age',
          boundaries: [0, 18, 35, 50, 65, 100],
          default: 'Unknown',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    // Gender distribution
    const genderDistribution = await Patient.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    const growth = newPatientsLastMonth > 0 
      ? ((newPatientsThisMonth - newPatientsLastMonth) / newPatientsLastMonth * 100).toFixed(2)
      : 0;

    res.json({
      totalPatients,
      newPatientsThisMonth,
      newPatientsLastMonth,
      growth: parseFloat(growth),
      ageDistribution,
      genderDistribution: genderDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Get patient stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/ai-insights
// @desc    Get AI analysis insights
// @access  Private
router.get('/ai-insights', [auth, checkPermission('ai_analysis', 'read')], async (req, res) => {
  try {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Recent AI analyses
    const recentAnalyses = await AIAnalysis.find({
      createdAt: { $gte: thisMonth }
    })
      .populate('patient', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10);

    // Analysis type distribution
    const analysisTypes = await AIAnalysis.aggregate([
      {
        $match: {
          createdAt: { $gte: thisMonth }
        }
      },
      {
        $group: {
          _id: '$analysisType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Success rate
    const successRate = await AIAnalysis.aggregate([
      {
        $match: {
          createdAt: { $gte: thisMonth }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Common findings
    const commonFindings = await AIAnalysis.aggregate([
      {
        $match: {
          analysisType: 'xray',
          status: 'completed',
          createdAt: { $gte: thisMonth }
        }
      },
      { $unwind: '$results.findings' },
      {
        $group: {
          _id: '$results.findings.type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      recentAnalyses,
      analysisTypes: analysisTypes.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      successRate: successRate.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      commonFindings
    });
  } catch (error) {
    console.error('Get AI insights error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper functions
async function calculateMonthlyRevenue(startDate, endDate) {
  // This would integrate with your actual billing system
  // For now, we'll simulate based on completed appointments
  const completedAppointments = await Appointment.countDocuments({
    appointmentDate: { $gte: startDate, $lt: endDate },
    status: 'completed'
  });

  // Simulate average revenue per appointment
  const averageRevenuePerAppointment = 150;
  return completedAppointments * averageRevenuePerAppointment;
}

async function getRevenueTrend() {
  const trends = [];
  const today = new Date();

  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
    
    const revenue = await calculateMonthlyRevenue(monthStart, monthEnd);
    
    trends.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      revenue
    });
  }

  return trends;
}

module.exports = router;
