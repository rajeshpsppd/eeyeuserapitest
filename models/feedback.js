var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
	userId: { type: String },
	username: { type: String, required: true },
	company: { type: String},
	phone: { type: String},
	email: { type: String, lowercase: false, required: true}, 
	subject: { type: String, required: true }, 
	messages: { type: String, required: true },
	response: { type: String },
	created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', schema);
