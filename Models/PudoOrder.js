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
    default:false
  }
});

const PudoOrder = mongoose.model("PudoOrder", PudoOrderSchema);

module.exports = PudoOrder;