const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
require("dotenv").config();
const PudoOrder = require("./Models/PudoOrder");
const PudoShipmentStatus = require("./Models/PudoShipmentStatus");
const PudoShipment = require("./Models/PudoShipmentStatus");

const { PUDO_URL, PUDO_CODE, PUDO_PASSWORD } = process.env;

router.get("/", function (req, res) {
    res.send("Welcome to the Webhooks API");
});

router.post("/pd_shipment_status", async function (req, res) {
    const payload = req.body;
    if (!payload || !payload.order_id)
        return res.status(500).send({
            message: "No order id presented",
        });

    const pudoOrder = await PudoOrder.findOne({
        orderId: payload.order_id,
    }).populate("shipmentStatuses");

    if (!pudoOrder) return res.status(404);

    const shipmentStatus = pudoOrder.shipmentStatuses?.find((ss) =>
        ss.trackingEvents?.some((te) => te.trackingStatusCode === "DEL")
    );

    if (shipmentStatus)
        return res.status(200).send({
            data: {
                status: "DEL",
                date: shipmentStatus.trackingEvents.find(
                    (te) => te.trackingStatusCode === "DEL"
                ).trackingDateStr,
            },
        });
    else {
        const lastShipmentStatus = pudoOrder.shipmentStatuses?.sort((a, b) => {
            return b.created - a.created;
        })[0];

        if (
            !lastShipmentStatus ||
            isLessThan24HourAgo(lastShipmentStatus?.created)
        ) {
            console.log(
                "isLessThan24HourAgo",
                isLessThan24HourAgo(lastShipmentStatus.created)
            );
            await PlaceShipmentStatus(
                pudoOrder,
                payload.tracking_number
            );
            const updatedPudoOrder = await PudoOrder.findOne({
                orderId: payload.order_id,
            }).populate("shipmentStatuses");

            const updatedLastShipmentStatus =
                updatedPudoOrder.shipmentStatuses?.sort((a, b) => {
                    return b.created - a.created;
                })?.[0];

            const lastTrackinEvent =
                updatedLastShipmentStatus?.response?.trackingEvents?.sort(
                    (a, b) => {
                        return (
                            new Date(b.trackingDateStr) -
                            new Date(a.trackingDateStr)
                        );
                    }
                )?.[0];

            return res.status(200).send({
                data: {
                    status: lastTrackinEvent.trackingStatusCode,
                    date: lastTrackinEvent.trackingDateStr,
                },
            });
        } else {
            const lastTrackinEvent = lastShipmentStatus?.response?.trackingEvents?.sort((a, b) => {
                return (
                    new Date(b.trackingDateStr) - new Date(a.trackingDateStr)
                );
            })?.[0];

            if (!lastTrackinEvent)
                return res.status(200).send({
                    data: {
                        status: "REG",
                        date: pudoOrder.created,
                    },
                });

            return res.status(200).send({
                data: {
                    status: lastTrackinEvent.trackingStatusCode,
                    date: lastTrackinEvent.trackingDateStr,
                },
            });
        }
    }
});

router.post("/fulfillment_webhook", async function (req, res) {
    console.log("Endpoint was called");
    const payload = req.body;

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
            dealerNo: +payload.destination.company
                .split(" ")[0]
                .replace(/^\D+/g, ""),
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
            shipment: { response: pudo_data },
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
        await PlaceShipmentStatus(pudo_order_from_db, payload.tracking_number);

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

async function PlaceShipmentStatus(pudo_order_from_db, trackingNumber) {
    console.log(`Placing order ${pudo_order_from_db.orderNumber} shipment `);

    const pudo_place_shipment_req_data = {
        partnerCode: PUDO_CODE,
        partnerPassword: PUDO_PASSWORD,
        orderDetails: pudo_order_from_db.orderNumber,
        trackingNumber: trackingNumber,
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

    const pudoShipmentStatus = await PudoShipmentStatus.create({
        order: pudo_order_from_db._id,
        response: pudo_place_shipment_data,
    });

    pudo_order_from_db.shipmentStatuses.push(pudoShipmentStatus._id);
    const res = await pudo_order_from_db.save();

    if (pudo_place_shipment_data?.Result?.toUpperCase() != "SUCCESS")
        throw new Error("Could not place shipmentstatus at pudo");

    console.log(
        `Order ${pudo_order_from_db.orderNumber} shipment was successfully placed`
    );

    return res;
}

function isLessThan24HourAgo(date) {
    // 👇️                    hour  min  sec  milliseconds
    const twentyFourHrInMs = 24 * 60 * 60 * 1000;

    const twentyFourHoursAgo = Date.now() - twentyFourHrInMs;
    console.log("date", date);
    console.log("twentyFourHoursAgo", twentyFourHoursAgo);

    return date.getTime() < twentyFourHoursAgo && date.getTime() <= Date.now();
}

module.exports = router;
