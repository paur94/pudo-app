const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
  },
  orderNumber: {
    type: String,
    required: true,
  },
  registeredInPudo: {
    type: Boolean,
    required: true,
  },
  shipmentStatusIsPlaced: {
    type: Boolean,
    required: true,
  }
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;