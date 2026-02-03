const mongoose = require('mongoose');

const toothSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
    min: 1,
    max: 32
  },
  quadrant: {
    type: String,
    enum: ['upper-right', 'upper-left', 'lower-left', 'lower-right'],
    required: true
  },
  surfaces: {
    mesial: {
      condition: {
        type: String,
        enum: ['healthy', 'caries', 'filling', 'crown', 'missing', 'implant', 'bridge'],
        default: 'healthy'
      },
      material: String,
      notes: String
    },
    distal: {
      condition: {
        type: String,
        enum: ['healthy', 'caries', 'filling', 'crown', 'missing', 'implant', 'bridge'],
        default: 'healthy'
      },
      material: String,
      notes: String
    },
    occlusal: {
      condition: {
        type: String,
        enum: ['healthy', 'caries', 'filling', 'crown', 'missing', 'implant', 'bridge'],
        default: 'healthy'
      },
      material: String,
      notes: String
    },
    buccal: {
      condition: {
        type: String,
        enum: ['healthy', 'caries', 'filling', 'crown', 'missing', 'implant', 'bridge'],
        default: 'healthy'
      },
      material: String,
      notes: String
    },
    lingual: {
      condition: {
        type: String,
        enum: ['healthy', 'caries', 'filling', 'crown', 'missing', 'implant', 'bridge'],
        default: 'healthy'
      },
      material: String,
      notes: String
    }
  },
  mobility: {
    type: Number,
    min: 0,
    max: 3,
    default: 0
  },
  pocketDepth: {
    mesial: { type: Number, min: 0, max: 15 },
    distal: { type: Number, min: 0, max: 15 },
    buccal: { type: Number, min: 0, max: 15 },
    lingual: { type: Number, min: 0, max: 15 }
  },
  bleeding: {
    type: Boolean,
    default: false
  },
  plaque: {
    type: Boolean,
    default: false
  },
  notes: String
});

const odontogramSchema = new mongoose.Schema({
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
  version: {
    type: Number,
    default: 1
  },
  teeth: [toothSchema],
  treatmentPlan: [{
    tooth: Number,
    procedure: String,
    priority: {
      type: String,
      enum: ['urgent', 'high', 'medium', 'low'],
      default: 'medium'
    },
    estimatedCost: Number,
    estimatedDuration: Number, // in minutes
    status: {
      type: String,
      enum: ['planned', 'in-progress', 'completed', 'cancelled'],
      default: 'planned'
    },
    notes: String,
    scheduledDate: Date
  }],
  periodontalChart: {
    generalNotes: String,
    overallHealth: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    },
    recommendations: [String]
  },
  images: [{
    filename: String,
    originalName: String,
    description: String,
    uploadDate: { type: Date, default: Date.now }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  completedTreatments: [{
    tooth: Number,
    procedure: String,
    date: Date,
    cost: Number,
    notes: String,
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

// Initialize default teeth structure
odontogramSchema.pre('save', function(next) {
  if (this.isNew && this.teeth.length === 0) {
    // Initialize 32 teeth with default values
    for (let i = 1; i <= 32; i++) {
      let quadrant;
      if (i >= 1 && i <= 8) quadrant = 'upper-right';
      else if (i >= 9 && i <= 16) quadrant = 'upper-left';
      else if (i >= 17 && i <= 24) quadrant = 'lower-left';
      else quadrant = 'lower-right';

      this.teeth.push({
        number: i,
        quadrant: quadrant,
        surfaces: {
          mesial: { condition: 'healthy' },
          distal: { condition: 'healthy' },
          occlusal: { condition: 'healthy' },
          buccal: { condition: 'healthy' },
          lingual: { condition: 'healthy' }
        }
      });
    }
  }
  next();
});

// Index for efficient queries
odontogramSchema.index({ patient: 1, version: -1 });
odontogramSchema.index({ doctor: 1, createdAt: -1 });

module.exports = mongoose.model('Odontogram', odontogramSchema);
