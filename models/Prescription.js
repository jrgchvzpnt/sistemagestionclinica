const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  genericName: {
    type: String,
    trim: true
  },
  dosage: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  instructions: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  refills: {
    type: Number,
    default: 0
  },
  notes: String
});

const prescriptionSchema = new mongoose.Schema({
  prescriptionId: {
    type: String,
    unique: true,
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clinic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  medications: [medicationSchema],
  diagnosis: {
    type: String,
    required: true
  },
  symptoms: [String],
  allergies: [String],
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'expired'],
    default: 'active'
  },
  prescriptionDate: {
    type: Date,
    default: Date.now
  },
  expirationDate: {
    type: Date,
    required: true
  },
  pharmacy: {
    name: String,
    address: String,
    phone: String
  },
  dispensed: {
    isDispensed: {
      type: Boolean,
      default: false
    },
    dispensedDate: Date,
    dispensedBy: String,
    pharmacyNotes: String
  },
  digitalSignature: {
    doctorSignature: String,
    timestamp: Date,
    ipAddress: String
  },
  qrCode: String, // For verification
  notes: String,
  followUpInstructions: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate prescription ID
prescriptionSchema.pre('save', async function(next) {
  if (!this.prescriptionId) {
    const count = await mongoose.model('Prescription').countDocuments();
    this.prescriptionId = `RX-${String(count + 1).padStart(8, '0')}`;
  }
  
  // Set expiration date if not provided (default 30 days)
  if (!this.expirationDate) {
    this.expirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  
  next();
});

// Check if prescription is expired
prescriptionSchema.virtual('isExpired').get(function() {
  return new Date() > this.expirationDate;
});

// Get days until expiration
prescriptionSchema.virtual('daysUntilExpiration').get(function() {
  const today = new Date();
  const expiration = new Date(this.expirationDate);
  const diffTime = expiration - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
prescriptionSchema.set('toJSON', {
  virtuals: true
});

// Index for efficient queries
prescriptionSchema.index({ patient: 1, prescriptionDate: -1 });
prescriptionSchema.index({ doctor: 1, prescriptionDate: -1 });
prescriptionSchema.index({ status: 1, expirationDate: 1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
