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
  console.log("Endpoint was called");
  const payload = req.body;
  console.log(payload, "payload")
  if (!payload || !payload.order_id)
    return res.status(500).send({
      message: "No order id presented",
    });

  console.log(`Order ${payload.order_id} fulfillment webhook received`);

  if (
    !(
      payload.tracking_number &&
      payload.destination?.company?.indexOf("PUDO") > -1
    )
  ) {
    console.log(`Order ${payload.order_id} is not PUDO order`);
    res.status(200).send({
      message: "Webhook Event successfully logged",
    });
    return;
  }

  const pudo_order_from_db = await PudoOrder.findOne({
    orderId: payload.order_id,
  });
  if (!pudo_order_from_db) {
    console.log(`Registering order ${payload.order_id}`);

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
    console.log(pudo_data, 'PUDO placed shipment')

    if (!pudo_data || pudo_data.Result?.toUpperCase() != "SUCCESS")
      return res.status(500).send({
        message: "PUDO Registration was not successfull",
      });

    if (!pudo_data?.shipment?.PUDONo)
      return res.status(500).send({
        message: "Could not find PUDO number",
      });

    const pudo_order_res = await PudoOrder.create({
      orderId: payload.order_id,
      orderNumber: payload.name,
      PudoNumber: pudo_data?.shipment?.PUDONo,
    });
    console.log(`Order ${payload.order_id} successfully registered`);

    return res.status(200).send({
      message: "Webhook Event successfully logged",
    });
  } else if (
    pudo_order_from_db &&
    !pudo_order_from_db?.shipmentStatusIsPlaced &&
    payload.shipment_status === "delivered"
  ) {
    console.log(`Placing order ${payload.order_id} shipment `);

    const pudo_place_shipment_req_data = {
      partnerCode: PUDO_CODE,
      partnerPassword: PUDO_PASSWORD,
      orderDetails: pudo_order_from_db.orderNumber,
      trackingNumber: payload.tracking_number,
    };

    const pudo_place_shipment_response = await fetch(
      `${PUDO_URL}/PlaceShipmentStatus`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pudo_place_shipment_req_data),
      }
    );
    const pudo_place_shipment_data = await pudo_place_shipment_response.json();
    console.log(pudo_place_shipment_data, 'PUDO placed shipment status')

    if (pudo_place_shipment_data?.Result?.toUpperCase() != "SUCCESS")
      return res.status(500).send({
        message: "Shipment was not placed at PUDO",
        error: pudo_place_shipment_data?.ErrorMessage,
      });

    console.log(`Order ${payload.order_id} shipment was successfully placed`);

    return res.status(200).send({
      message: "Order shipment was placed at PUDO",
    });
  } else {
    console.log(`Order ${payload.order_id} is registered doing nothing`);

    return res.status(200).send({
      message: "Order already registered and shipent status is placed",
    });
  }
});

module.exports = router;
