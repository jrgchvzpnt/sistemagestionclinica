const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { body, validationResult } = require('express-validator');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const { auth, authorize, checkPermission } = require('../middleware/auth');

const router = express.Router();

// Billing model (inline for this example - should be in separate file)
const mongoose = require('mongoose');

const BillingSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  items: [{
    description: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'], 
    default: 'draft' 
  },
  paymentMethod: { type: String, enum: ['cash', 'card', 'insurance', 'stripe'] },
  stripePaymentIntentId: { type: String },
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    copay: Number,
    deductible: Number
  },
  dueDate: { type: Date },
  paidAt: { type: Date },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Billing = mongoose.model('Billing', BillingSchema);

// @route   GET /api/billing
// @desc    Get all invoices
// @access  Private
router.get('/', [auth, checkPermission('billing', 'read')], async (req, res) => {
  try {
    const { page = 1, limit = 10, status, patient, dateFrom, dateTo } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (patient) {
      query.patient = patient;
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const invoices = await Billing.find(query)
      .populate('patient', 'firstName lastName patientId')
      .populate('appointment', 'appointmentDate type')
      .populate('clinic', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Billing.countDocuments(query);

    res.json({
      invoices,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/billing/:id
// @desc    Get invoice by ID
// @access  Private
router.get('/:id', [auth, checkPermission('billing', 'read')], async (req, res) => {
  try {
    const invoice = await Billing.findById(req.params.id)
      .populate('patient')
      .populate('appointment')
      .populate('clinic', 'name address phone email')
      .populate('createdBy', 'firstName lastName');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/billing
// @desc    Create new invoice
// @access  Private
router.post('/', [
  auth,
  checkPermission('billing', 'create'),
  body('patient').notEmpty().withMessage('Patient is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.description').notEmpty().withMessage('Item description is required'),
  body('items.*.unitPrice').isNumeric().withMessage('Valid unit price is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Valid quantity is required')
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

    // Calculate totals
    const items = req.body.items.map(item => ({
      ...item,
      total: item.quantity * item.unitPrice
    }));

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = req.body.tax || 0;
    const discount = req.body.discount || 0;
    const total = subtotal + tax - discount;

    const invoice = new Billing({
      invoiceNumber: generateInvoiceNumber(),
      patient: req.body.patient,
      appointment: req.body.appointment,
      clinic: req.user.clinics[0],
      items,
      subtotal,
      tax,
      discount,
      total,
      dueDate: req.body.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      insuranceInfo: req.body.insuranceInfo,
      notes: req.body.notes,
      createdBy: req.user.id
    });

    await invoice.save();

    // Populate the created invoice
    await invoice.populate('patient', 'firstName lastName');

    res.status(201).json({
      message: 'Invoice created successfully',
      invoice
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/billing/:id
// @desc    Update invoice
// @access  Private
router.put('/:id', [
  auth,
  checkPermission('billing', 'update'),
  body('status').optional().isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Recalculate totals if items are updated
    let updateData = { ...req.body, updatedAt: Date.now() };
    
    if (req.body.items) {
      const items = req.body.items.map(item => ({
        ...item,
        total: item.quantity * item.unitPrice
      }));

      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const tax = req.body.tax || 0;
      const discount = req.body.discount || 0;
      const total = subtotal + tax - discount;

      updateData = {
        ...updateData,
        items,
        subtotal,
        tax,
        discount,
        total
      };
    }

    const invoice = await Billing.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('patient', 'firstName lastName');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json({
      message: 'Invoice updated successfully',
      invoice
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/billing/:id/payment-intent
// @desc    Create Stripe payment intent
// @access  Private
router.post('/:id/payment-intent', [
  auth,
  checkPermission('billing', 'update')
], async (req, res) => {
  try {
    const invoice = await Billing.findById(req.params.id)
      .populate('patient', 'firstName lastName email');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ message: 'Invoice already paid' });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(invoice.total * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        invoiceId: invoice._id.toString(),
        patientId: invoice.patient._id.toString(),
        clinicId: invoice.clinic.toString()
      },
      description: `Invoice ${invoice.invoiceNumber} - ${invoice.patient.firstName} ${invoice.patient.lastName}`
    });

    // Update invoice with payment intent ID
    invoice.stripePaymentIntentId = paymentIntent.id;
    await invoice.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/billing/:id/confirm-payment
// @desc    Confirm payment and update invoice status
// @access  Private
router.post('/:id/confirm-payment', [
  auth,
  checkPermission('billing', 'update'),
  body('paymentMethod').isIn(['cash', 'card', 'insurance', 'stripe']).withMessage('Valid payment method is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const invoice = await Billing.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ message: 'Invoice already paid' });
    }

    // If Stripe payment, verify the payment intent
    if (req.body.paymentMethod === 'stripe' && invoice.stripePaymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(invoice.stripePaymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ message: 'Payment not completed' });
      }
    }

    // Update invoice status
    invoice.status = 'paid';
    invoice.paymentMethod = req.body.paymentMethod;
    invoice.paidAt = new Date();
    invoice.notes = req.body.notes ? `${invoice.notes || ''}\nPayment confirmed: ${req.body.notes}` : invoice.notes;

    await invoice.save();

    res.json({
      message: 'Payment confirmed successfully',
      invoice
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/billing/webhook
// @desc    Stripe webhook handler
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      
      // Find and update the invoice
      const invoice = await Billing.findOne({ 
        stripePaymentIntentId: paymentIntent.id 
      });
      
      if (invoice) {
        invoice.status = 'paid';
        invoice.paymentMethod = 'stripe';
        invoice.paidAt = new Date();
        await invoice.save();
        
        console.log(`Invoice ${invoice.invoiceNumber} marked as paid via Stripe`);
      }
      break;
      
    case 'payment_intent.payment_failed':
      console.log('Payment failed:', event.data.object);
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// @route   GET /api/billing/stats/dashboard
// @desc    Get billing statistics for dashboard
// @access  Private
router.get('/stats/dashboard', [auth, checkPermission('billing', 'read')], async (req, res) => {
  try {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    // Monthly revenue
    const monthlyRevenue = await Billing.aggregate([
      {
        $match: {
          status: 'paid',
          paidAt: { $gte: thisMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);

    // Outstanding invoices
    const outstandingInvoices = await Billing.aggregate([
      {
        $match: {
          status: { $in: ['sent', 'overdue'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Invoices by status
    const invoicesByStatus = await Billing.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$total' }
        }
      }
    ]);

    // Payment methods distribution
    const paymentMethods = await Billing.aggregate([
      {
        $match: { status: 'paid' }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          total: { $sum: '$total' }
        }
      }
    ]);

    // Revenue trend (last 6 months)
    const revenueTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
      
      const monthRevenue = await Billing.aggregate([
        {
          $match: {
            status: 'paid',
            paidAt: { $gte: monthStart, $lt: monthEnd }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$total' }
          }
        }
      ]);

      revenueTrend.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue[0]?.total || 0
      });
    }

    res.json({
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      outstandingAmount: outstandingInvoices[0]?.total || 0,
      outstandingCount: outstandingInvoices[0]?.count || 0,
      invoicesByStatus: invoicesByStatus.reduce((acc, item) => {
        acc[item._id] = { count: item.count, total: item.total };
        return acc;
      }, {}),
      paymentMethods: paymentMethods.reduce((acc, item) => {
        acc[item._id] = { count: item.count, total: item.total };
        return acc;
      }, {}),
      revenueTrend
    });
  } catch (error) {
    console.error('Get billing stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to generate invoice number
function generateInvoiceNumber() {
  const prefix = 'INV';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

module.exports = router;
