const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
require("dotenv").config();

const { PUDO_URL, PUDO_CODE, PUDO_PASSWORD } = process.env;

router.get("/", function (req, res) {
  res.send("Welcome to the Webhooks API");
});

router.post("/fulfillment_webhook", async function (req, res) {
  const payload = req.body;

  if (!payload.tracking_number) {
    res.status(200).send({
      message: "Webhook Event successfully logged",
    });
    return;
  }

  const pudo_req_data = {
    partnerCode: PUDO_CODE,
    partnerPassword: PUDO_PASSWORD,
    trackingNumber: "1234",
    memberMobile: payload.destination.phone,
    memberEmail: payload.email,
  };

  const pudo_response = await fetch(PUDO_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pudo_req_data),
  });
  const pudo_data = await pudo_response.json();
  console.log(pudo_data);

  res.status(200).send({
    message: "Webhook Event successfully logged",
  });

  res.status(200).end();

});

module.exports = router;
