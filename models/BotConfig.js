// models/BotConfig.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BotConfigSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  config: { type: String, required: true }
});

module.exports = mongoose.model('BotConfig', BotConfigSchema);
