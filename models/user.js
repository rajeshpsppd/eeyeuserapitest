const mongoose = require('mongoose');

// User Schema
const UserSchema = mongoose.Schema({
  userType: { type: String, required: true, default: 'customer' },  // admin, vendor etc
  isActive: {type: Boolean, default: false },
  name: { type: String, required: true },
  company: { type: String, required: true },
  displayname: { type: String, required: false },
  vendor: { type: String, required: false }, // dispName, mid, logo 
  email: { type: String, required: true, unique: true}, 
  otp: { type: String }, 
  phone: { type: String },
  alternatephone: { type: String, required: false },
  password: { type: String, required: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  tasklist: String,
  address: { type: String, required: false },
  // address: [{
	// housedetail: { type: String, required: false },
	// pincode: { type: Number, required: false },
	// city: { type: String, required: false },
	// district: { type: String, required: false },
	// state: { type: String, required: false },
	// country: { type: String, required: false },
	// _id: false
  // }],
	questions: [{
		question: {type: String, required: false},
		answer: {type: String, required: false},
		created_at: { type: Date, default: Date.now }
	}],
  subscriptionType: { type: String, required: true, default: 'standard' },
  deviceFP: { type: String, required: false },
  geoip: { type: String, required: false },
  photo: { type: String, required: false },
  acBalance: { type: Number, default: 0.0 },
  creditHistory: [], //credit History
  debitHistory: [], //credit History
  paylater: { type: Boolean, default: false},
  created_at: { type: Date, default: Date.now },
  login_at: { type: Date, default: Date.now }
});

const User = module.exports = mongoose.model('User', UserSchema);