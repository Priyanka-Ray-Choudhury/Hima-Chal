const mongoose = require("mongoose");
const { Schema } = mongoose;

const DriverSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  contact: {
    type: Number,
    required: true,
  },
  vehicalreq: {
    type: String,
    required: true,
  },
  vehicalchassis: {
    type: String,
    required: true,
  },
  vehicalmodel: {
    type: String,
    required: true,
  },
  vehicaldlno: {
    type: String,
    required: true,
  },
  vehicalrcno: {
    type: String,
    required: true,
  },
});
const Driver = mongoose.model("driver", DriverSchema);
module.exports = Driver;