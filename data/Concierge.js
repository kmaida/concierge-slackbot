const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*------------------
  CONCIERGE SCHEMA
------------------*/
const conciergeSchema = new Schema({
  channel: { type: String, required: true },
  assigned: String
});

module.exports = mongoose.model('Concierge', conciergeSchema);