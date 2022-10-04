const mongoose = require("mongoose");

const PudoShipmentStatusSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: "PudoOrder" },
    response: {
        ErrorMessage: String,
        Result: String,
        dealerNo: Number,
        orderDetails: String,
        trackingEvents: [
            {
                pickupPersonName: String,
                pickupPersonSignature: String,
                trackingDate: String,
                trackingDateStr: String,
                trackingStatusCode: String,
                trackingStatusS: String,
            },
        ],
    },
    created: {
        type: Date,
        default: Date.now,
    },
});

const PudoShipmentStatus = mongoose.model("PudoShipmentStatus", PudoShipmentStatusSchema);

module.exports = PudoShipmentStatus;
