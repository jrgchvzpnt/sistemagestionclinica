const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentId: {
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
  appointmentDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 30
  },
  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'procedure', 'cleaning', 'emergency', 'checkup'],
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  reason: {
    type: String,
    required: true
  },
  notes: String,
  symptoms: [String],
  diagnosis: String,
  treatment: String,
  prescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  },
  followUpDate: Date,
  cost: {
    consultation: { type: Number, default: 0 },
    procedures: [{ 
      name: String, 
      cost: Number 
    }],
    total: { type: Number, default: 0 }
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['cash', 'card', 'transfer', 'insurance']
    },
    amount: Number,
    transactionId: String
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'call']
    },
    sentAt: Date,
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed']
    }
  }],
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadDate: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Generate appointment ID
appointmentSchema.pre('save', async function(next) {
  if (!this.appointmentId) {
    const count = await mongoose.model('Appointment').countDocuments();
    this.appointmentId = `APT${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Index for efficient queries
appointmentSchema.index({ appointmentDate: 1, doctor: 1 });
appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ clinic: 1, appointmentDate: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
