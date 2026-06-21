const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name: String,

    fields: {
        size: [String],
        design: [String],
        fandom: [String],
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