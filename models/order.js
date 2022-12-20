
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema(
	{
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
	customerName: String,
    products: [{
		productId:	{ type: mongoose.Schema.Types.ObjectId, ref: "Products", required: true },
		vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
		vendorName: String,
		name: { type: String, required: true },
		size: String,
		colors: String,
		qty: { type: Number, required: true },
		price: { type: Number, required: true },
		status: String,
		_id: false
	}],
    amount: { type: Number, required: [true, "An order must have a total"] },
	rsmCharge: { type: Number, default: 1.0, required: [true, "An RSM commission on total"]},
	payOption: String,
	splitMethod: String,
	payIteration: {type: Number, default: 0},
	payStatus: String,
	txnId: String
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Order', schema);
