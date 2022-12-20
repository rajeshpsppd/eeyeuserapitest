var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    // scheme: []
	// userId: { type: String },
	// name: { type: String, required: true },
	// phone: { type: String, required: true },
	// email: { type: String, lowercase: false, required: false}, 
	// subject: { type: String, required: true }, 
	// msg: { type: String, required: true },
	// response: { type: String },
	// created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sensor', schema);
