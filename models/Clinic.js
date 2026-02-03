const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
  clinicId: {
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
    enum: ['general', 'dental', 'specialty', 'multi-specialty'],
    required: true
  },
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'México'
    }
  },
  contactInfo: {
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    website: String,
    fax: String
  },
  businessHours: {
    monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    saturday: { open: String, close: String, isOpen: { type: Boolean, default: false } },
    sunday: { open: String, close: String, isOpen: { type: Boolean, default: false } }
  },
  services: [{
    name: String,
    description: String,
    category: String,
    price: Number,
    duration: Number, // in minutes
    isActive: { type: Boolean, default: true }
  }],
  staff: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    startDate: Date,
    isActive: { type: Boolean, default: true }
  }],
  equipment: [{
    name: String,
    model: String,
    serialNumber: String,
    purchaseDate: Date,
    warrantyExpiration: Date,
    maintenanceSchedule: String,
    status: {
      type: String,
      enum: ['operational', 'maintenance', 'repair', 'retired'],
      default: 'operational'
    }
  }],
  rooms: [{
    number: String,
    name: String,
    type: {
      type: String,
      enum: ['consultation', 'procedure', 'surgery', 'waiting', 'lab', 'xray']
    },
    capacity: Number,
    equipment: [String],
    isAvailable: { type: Boolean, default: true }
  }],
  billing: {
    taxId: String,
    bankAccount: String,
    paymentMethods: [String],
    currency: { type: String, default: 'MXN' }
  },
  insurance: {
    providers: [String],
    policies: [{
      provider: String,
      policyNumber: String,
      coverage: String,
      expirationDate: Date
    }]
  },
  certifications: [{
    name: String,
    issuedBy: String,
    issuedDate: Date,
    expirationDate: Date,
    certificateNumber: String
  }],
  settings: {
    timezone: { type: String, default: 'America/Mexico_City' },
    language: { type: String, default: 'es' },
    appointmentDuration: { type: Number, default: 30 }, // minutes
    workingDays: [String],
    holidays: [Date]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate clinic ID
clinicSchema.pre('save', async function(next) {
  if (!this.clinicId) {
    const count = await mongoose.model('Clinic').countDocuments();
    this.clinicId = `CLI${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Virtual for full address
clinicSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

// Virtual for active staff count
clinicSchema.virtual('activeStaffCount').get(function() {
  return this.staff.filter(s => s.isActive).length;
});

// Ensure virtual fields are serialized
clinicSchema.set('toJSON', {
  virtuals: true
});

// Index for efficient queries
clinicSchema.index({ code: 1 });
clinicSchema.index({ type: 1, isActive: 1 });

module.exports = mongoose.model('Clinic', clinicSchema);
