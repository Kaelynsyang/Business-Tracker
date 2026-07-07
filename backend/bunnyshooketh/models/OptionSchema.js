const mongoose = require("mongoose");

const OptionSchema = new mongoose.Schema(
  {
    value: String,
    dependsOn: {
      type: Map,
      of: String
    }
  },
  { _id: false }
);

module.exports = OptionSchema;