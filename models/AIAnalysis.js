const mongoose = require('mongoose');

const aiAnalysisSchema = new mongoose.Schema({
  analysisId: {
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
  type: {
    type: String,
    enum: ['xray-dental', 'lab-report', 'medical-comparison'],
    required: true
  },
  originalFile: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String
  },
  aiResults: {
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    findings: [{
      category: String,
      description: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      confidence: Number,
      coordinates: {
        x: Number,
        y: Number,
        width: Number,
        height: Number
      }
    }],
    recommendations: [String],
    summary: String,
    technicalDetails: mongoose.Schema.Types.Mixed
  },
  doctorReview: {
    reviewed: {
      type: Boolean,
      default: false
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewDate: Date,
    doctorNotes: String,
    approved: Boolean,
    modifications: [String]
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'reviewed', 'archived', 'error'],
    default: 'processing'
  },
  processingTime: Number, // in milliseconds
  errorMessage: String,
  metadata: {
    aiModel: String,
    modelVersion: String,
    processingDate: { type: Date, default: Date.now },
    imageQuality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    },
    imageResolution: String
  },
  comparisonData: {
    previousAnalysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AIAnalysis'
    },
    changes: [{
      finding: String,
      changeType: {
        type: String,
        enum: ['improved', 'worsened', 'stable', 'new', 'resolved']
      },
      description: String
    }]
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate analysis ID
aiAnalysisSchema.pre('save', async function(next) {
  if (!this.analysisId) {
    const count = await mongoose.model('AIAnalysis').countDocuments();
    const prefix = this.type === 'xray-dental' ? 'XRA' : 
                   this.type === 'lab-report' ? 'LAB' : 'CMP';
    this.analysisId = `${prefix}${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Index for efficient queries
aiAnalysisSchema.index({ patient: 1, createdAt: -1 });
aiAnalysisSchema.index({ doctor: 1, type: 1 });
aiAnalysisSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('AIAnalysis', aiAnalysisSchema);
