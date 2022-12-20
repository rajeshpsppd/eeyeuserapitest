var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
	name: { type: String },
	company: { type: String},
	phone: { type: String},
	email: { type: String, lowercase: false, required: true}, 
    messages: { type: String, required: true },
    actioned:{type: Boolean},
    requested_at: { type: Date, default: Date.now },
	created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('request_demo', schema);