const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profileSchema = mongoose.Schema({ // eslint-disable-line new-cap
  name: String,
  locked: Boolean,
  locked_dt: Date,
  error_cnt: Number,
  use_cnt: Number,
  meta: Schema.Types.Mixed,
  disabled: Boolean
});

module.exports = mongoose.model('Profile', profileSchema);
