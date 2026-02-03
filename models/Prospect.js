const mongoose = require('mongoose');

const prospectSchema = new mongoose.Schema({
  prospectId: {
    type: String,
    unique: true,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  source: {
    type: String,
    enum: ['social', 'advertisement', 'walk-in', 'referral', 'website', 'phone'],
    required: true
  },
  interestedService: {
    type: String,
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'converted', 'lost'],
    default: 'new'
  },
  conversionRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 30
  },
  notes: String,
  interactions: [{
    type: {
      type: String,
      enum: ['call', 'email', 'sms', 'meeting', 'follow-up']
    },
    date: { type: Date, default: Date.now },
    notes: String,
    outcome: {
      type: String,
      enum: ['positive', 'neutral', 'negative', 'no-response']
    },
    nextAction: String,
    nextActionDate: Date,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  preferences: {
    preferredContactMethod: {
      type: String,
      enum: ['phone', 'email', 'sms', 'whatsapp']
    },
    preferredTime: String,
    language: {
      type: String,
      default: 'es'
    }
  },
  clinic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true
  },
  convertedToPatient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  },
  conversionDate: Date,
  estimatedValue: Number,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate prospect ID
prospectSchema.pre('save', async function(next) {
  if (!this.prospectId) {
    const count = await mongoose.model('Prospect').countDocuments();
    this.prospectId = `PRO${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Virtual for full name
prospectSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for days since creation
prospectSchema.virtual('daysSinceCreated').get(function() {
  const today = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(today - created);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
prospectSchema.set('toJSON', {
  virtuals: true
});

// Index for efficient queries
prospectSchema.index({ status: 1, createdAt: -1 });
prospectSchema.index({ assignedTo: 1, status: 1 });
prospectSchema.index({ clinic: 1, status: 1 });

module.exports = mongoose.model('Prospect', prospectSchema);
