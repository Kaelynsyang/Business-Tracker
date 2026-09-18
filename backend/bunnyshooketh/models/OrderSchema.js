const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },

    deals: [{
        name: String,
        discount: Number
    }],
    paymentMethod: String,
    event: String, 

    items: [{
        product: String,
        option: mongoose.Schema.Types.Mixed,
        quantity: Number,
        unitPrice: Number,
        total: Number
    }],
    note: String,

    subtotal: Number,
    discount: Number, //i think i can get rid of this, i just calculate it
    total: Number
});

module.exports = mongoose.model(
    "Order",
    OrderSchema,
    "orders"
);