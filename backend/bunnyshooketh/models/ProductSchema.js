const mongoose = require("mongoose");
const OptionSchema = require("./OptionSchema");

const InventorySchema = new mongoose.Schema({
    design: String,
    size: String,
    stock: {
        type: Number,
        default: 0
    }
    },
    { _id: false}
);

const ProductSchema = new mongoose.Schema({
    name: String,

    fields: {
        size: [String],
        design: [OptionSchema],
        fandom: [OptionSchema],
        quantity: [Number]
    },

    inventory: [InventorySchema],

    pricing: {
        type: Map,
        of: Number
    }
});

module.exports = mongoose.model(
    'product', ProductSchema, "products"
)