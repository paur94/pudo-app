const mongoose = require("mongoose");

const PudoOrderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
    },
    orderNumber: {
        type: String,
        required: true,
    },
    PudoNumber: {
        type: String,
        required: true,
    },
    shipmentStatusIsPlaced: {
        type: Boolean,
        default: false,
    },
    shipment: { type: mongoose.Schema.Types.ObjectId, ref: "PudoShipment" },
    shipmentStatuses: [
        { type: mongoose.Schema.Types.ObjectId, ref: "PudoShipmentStatus" },
    ],
    created: {
        type: Date,
        default: Date.now,
    },
});

const PudoOrder = mongoose.model("PudoOrder", PudoOrderSchema);

module.exports = PudoOrder;
