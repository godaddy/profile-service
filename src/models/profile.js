import mongoose from 'mongoose';
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

export default mongoose.model('Profile', profileSchema);
