const express = require("express");
const cors = require("cors");

const routes = require("./routes");
const bodyParser = require("body-parser");
require("dotenv").config();
const mongoose = require("mongoose");
// App
console.log(process.env.PUDO_URL);
const app = express();
app.use(cors());
//mongoose
app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested, Content-Type, Accept Authorization"
    );
    if (req.method === "OPTIONS") {
        res.header(
            "Access-Control-Allow-Methods",
            "POST, PUT, PATCH, GET, DELETE"
        );
        return res.status(200).json({});
    }
    next();
});
 

mongoose.connect(process.env.MONGO_CONNECTION, (err) => {
    if (err) throw err;
    console.log("connected to MongoDB");
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
    console.log("Connected successfully");
});

app.use(routes);

app.use(
    bodyParser.json({
        verify: (req, res, buf, encoding) => {
            if (buf && buf.length) {
                req.rawBody = buf.toString(encoding || "utf8");
            }
        },
    })
);

// Set port
const port = process.env.PORT || "1337";
app.set("port", port);

app.use("/", routes);

// Server
app.listen(port, () => console.log(`Server running on localhost:${port}`));
