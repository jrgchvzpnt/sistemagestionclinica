const mongoose = require('mongoose');

const labProviderSchema = new mongoose.Schema({
  providerId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['diagnostic', 'pathology', 'molecular', 'reference', 'specialized'],
    required: true
  },
  specialties: [{
    type: String,
    enum: ['chemistry', 'pathology', 'hematology', 'molecular', 'microbiology', 'immunology']
  }],
  contactInfo: {
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true
    },
    fax: String,
    website: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'México' }
  },
  businessHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  services: [{
    name: String,
    code: String,
    category: String,
    turnaroundTime: String, // e.g., "24-48 hours"
    cost: Number,
    isActive: { type: Boolean, default: true }
  }],
  performance: {
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    totalTests: {
      type: Number,
      default: 0
    },
    averageTurnaround: Number, // in hours
    qualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    lastUpdated: Date
  },
  billing: {
    paymentTerms: String,
    currency: { type: String, default: 'MXN' },
    taxId: String,
    bankAccount: String
  },
  certifications: [{
    name: String,
    issuedBy: String,
    issuedDate: Date,
    expirationDate: Date,
    certificateNumber: String
  }],
  contracts: [{
    contractNumber: String,
    startDate: Date,
    endDate: Date,
    terms: String,
    isActive: { type: Boolean, default: true }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'active'
  },
  lastTestDate: Date,
  notes: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate provider ID
labProviderSchema.pre('save', async function(next) {
  if (!this.providerId) {
    const count = await mongoose.model('LabProvider').countDocuments();
    this.providerId = `LAB${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Virtual for full address
labProviderSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

// Virtual for current status
labProviderSchema.virtual('isCurrentlyOpen').get(function() {
  const now = new Date();
  const currentDay = now.toLocaleLowerCase().substring(0, 3); // mon, tue, etc.
  const currentTime = now.toTimeString().substring(0, 5); // HH:MM
  
  const todayHours = this.businessHours[currentDay];
  if (!todayHours || !todayHours.open || !todayHours.close) return false;
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
});

// Ensure virtual fields are serialized
labProviderSchema.set('toJSON', {
  virtuals: true
});

// Index for efficient queries
labProviderSchema.index({ status: 1, type: 1 });
labProviderSchema.index({ 'specialties': 1 });
labProviderSchema.index({ code: 1 });

module.exports = mongoose.model('LabProvider', labProviderSchema);
