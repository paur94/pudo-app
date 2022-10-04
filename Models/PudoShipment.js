const mongoose = require("mongoose");

const PudoShipmentSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: "PudoOrder" },
    response:{
        ErrorMessage: String,
        Result: String,
        shipment: {
            PUDONo: String,
            dealer: {
                dealerAddress1: String,
                dealerAddress2: String,
                dealerAnnualFee: String,
                dealerCity: String,
                dealerCountry: String,
                dealerDistance: Number,
                dealerHours: String,
                dealerID: String,
                dealerLanguages: String,
                dealerLatitude: Number,
                dealerLongitude: Number,
                dealerName: String,
                dealerNo: Number,
                dealerOpen24S: String,
                dealerPhone: String,
                dealerPostal: String,
                dealerProvince: String,
                dealerSupports: String
            },
            member: {
                memberAddress: String,
                memberCity: String,
                memberCompany: String,
                memberCompanyType: String,
                memberEmail: String,
                memberID: String,
                memberMobile: String,
                memberName: String,
                memberNo: String,
                memberPhone: String,
                memberPostal: String,
                memberProvince: String
            },
            orderDetails: String,
            trackingNumber: String
        },
    },
    created: {
        type: Date,
        default: Date.now,
    },
});

const PudoShipment = mongoose.model("PudoShipment", PudoShipmentSchema);

module.exports = PudoShipment;
