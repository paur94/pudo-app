const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
require("dotenv").config();
const PudoOrder = require("./Models/PudoOrder");

const { PUDO_URL, PUDO_CODE, PUDO_PASSWORD } = process.env;

router.get("/", function (req, res) {
  res.send("Welcome to the Webhooks API");
});

router.post("/fulfillment_webhook", async function (req, res) {
  const payload = req.body;

  if (!payload || !payload.order_id)
    return res.status(500).send({
      message: "No order id present",
    });

  if (
    !(
      payload.tracking_number &&
      payload.destination?.company?.indexOf("PUDO") > -1
    )
  ) {
    res.status(200).send({
      message: "Webhook Event successfully logged",
    });
    return;
  }

  const pudo_order_from_db = await PudoOrder.findOne({
    orderId: payload.order_id,
  });
  if (!pudo_order_from_db) {
    const pudo_req_data = {
      partnerCode: PUDO_CODE,
      partnerPassword: PUDO_PASSWORD,
      trackingNumber: payload.tracking_number,
      memberEmail: payload.email,
      memberName: payload.destination.name,
      memberPhone: payload.destination.phone,
      memberNo: "",
      orderDetails: payload.name,
      customerAccountNo: "",
      dealerNo: +payload.destination.company.split(" ")[0].replace(/^\D+/g, ""),
    };

    const pudo_response = await fetch(`${PUDO_URL}/PlaceShipment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pudo_req_data),
    });
    const pudo_data = await pudo_response.json();

    if (!pudo_data || pudo_data.Result?.toUpperCase() != "SUCCESS")
      return res.status(500).send({
        message: "Pudo Registraton was not successfull",
      });

    if (!pudo_data?.shipment?.PUDONo)
      return res.status(500).send({
        message: "Could not find pudo number",
      });

    const pudo_order_res = await PudoOrder.create({
      orderId: payload.order_id,
      orderNumber: payload.name,
      PudoNumber: pudo_data?.shipment?.PUDONo,
    });

    return res.status(200).send({
      message: "Webhook Event successfully logged",
    });
  } else if (
    pudo_order_from_db &&
    !pudo_order_from_db?.shipmentStatusIsPlaced &&
    payload.shipment_status === "delivered"
  ) {
    const pudo_place_shipment_req_data = {
      partnerCode: PUDO_CODE,
      partnerPassword: PUDO_PASSWORD,
      orderDetails: pudo_order_from_db.orderNumber,
      trackingNumber: payload.tracking_number,
    };

    const pudo_place_shipment_response = await fetch(`${PUDO_URL}/PlaceShipmentStatus`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pudo_place_shipment_req_data),
    });
    const pudo_place_shipment_data = await pudo_place_shipment_response.json();

    if (pudo_place_shipment_data?.Result?.toUpperCase() != "SUCCESS")
      return res.status(500).send({
        message: "Shipment was not placed at PUDO",
        error: pudo_place_shipment_data?.ErrorMessage,
      });
    return res.status(200).send({
      message: "Order shipment was placed at PUDO",
    });
  } else
    return res.status(200).send({
      message: "Order already registered and shipent status is placed",
    });
});

module.exports = router;
