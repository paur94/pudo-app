const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
  },
  orderNumber: {
    type: string,
    required: true,
  },
  registeredInPudo: {
    type: boolean,
    required: true,
  },
  shipmentStatusIsPlaced: {
    type: boolean,
    required: true,
  }
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;