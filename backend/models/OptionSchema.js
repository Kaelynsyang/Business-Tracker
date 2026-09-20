const mongoose = require("mongoose");

const OptionSchema = new mongoose.Schema(
  {
    value: String,
    stock: {  // is this needed here
      type: Number,
      default: 0
    },
    dependsOn: {
      type: Map,
      of: String
    }
  },
  { _id: false }
);

module.exports = OptionSchema;