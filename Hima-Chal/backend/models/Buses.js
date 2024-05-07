const mongoose = require("mongoose");
const { Schema } = mongoose;

const BusSchema = new Schema({
  busnumber: {
    type: String,
  },
  start: {
    type: String,
  },
  end: {
    type: String,

    unique: true,
  },
  stop: {
    type: Array,
  },
  geolocation: {
    latitude: Number,
    longitude: Number,
  },
  active: {
    type: Boolean,
  },
  latlong: {
    type: Array,
  },
  count: {
    type: Number,
    default: 0,
  },
  m: {
    type: String,
  },
});

const Bus = mongoose.model("bus", BusSchema);
module.exports = Bus;