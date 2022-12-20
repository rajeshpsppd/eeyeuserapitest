const mongoose = require('mongoose');

// Vendor Schema
const schema = mongoose.Schema({
	vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, "A vendor must have a userId"] },
	mid: {type: String},
    vendorType: { type: String, required: false },
	vendorStaus: { type: String, required: false },
	serviceChargeRate: { type: Number, default: 5.0, required: [true, "An service charge in %age"]},
	// serviceCharge: { type: Number, default: 0.0, required: [true, "Service charge total"]},
	// paidServiceCharge: { type: Number, default: 0.0, required: [true, "Service charge paid"]},
	// unpaidServiceCharge: { type: Number, default: 0.0, required: [true, "Service charge paid"]},
    chats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chatroom" }],
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
	payOptions: {
		gpay: {gpayNumber: String, qrcode: String},
		paytm: {paytmNumber: String, qrcode: String},
		bankDetail: {
		payeeAC: String,
		payeeName: String,
		bankBranch: String,
		isfcCode: String,
		accountType: String,
		required: false,
		_id: false
		}
	},
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "Customer" }],
  	created_at: { type: Date, default: Date.now },
	updated_at: { type: Date, default: Date.now }
  }
);
schema.pre('save', function(next){
	now = new Date();
	this.updated_at = now;
	if ( !this.created_at ) {
	this.created_at = now;
	}
	next();
});
const Vendor = module.exports = mongoose.model('Vendor', schema);
