const mongoose = require("mongoose");
const OptionSchema = require("./optionSchema");

const ProductSchema = new mongoose.Schema({
    name: String,

    fields: {
        size: [String],
        design: [OptionSchema],
        fandom: [OptionSchema],
        quantity: [Number]
    },

    pricing: {
        type: Map,
        of: Number
    }
});

module.exports = mongoose.model(
    'product', ProductSchema, "products"
)