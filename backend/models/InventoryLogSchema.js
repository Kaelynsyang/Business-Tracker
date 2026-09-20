const mongoose = require("mongoose");

const InventoryLogSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        productName: String,
        design: String,
        size: String,
        change: Number,
        stockBefore: Number,
        stockAfter: Number,
        note: String,

        createdAt: {
            type: Date,
            default: Date.now
        }
    }
)

const InventoryLog = mongoose.model("InventoryLog", InventoryLogSchema)

module.exports = InventoryLog;