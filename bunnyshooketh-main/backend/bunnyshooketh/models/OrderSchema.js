const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },

    deal: String,
    paymentMethod: String,

    items: [{
        product: String,
        option: mongoose.Schema.Types.Mixed,
        quantity: Number,
        unitPrice: Number,
        total: Number
    }],

    subtotal: Number,
    discount: Number,
    total: Number
});

module.exports = mongoose.model(
    "Order",
    OrderSchema,
    "orders"
);