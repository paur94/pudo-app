const express = require("express");
const routes = require("./routes");
const bodyParser = require('body-parser');
require('dotenv').config();
const mongoose = require("mongoose");
// App
console.log(process.env.PUDO_URL)
const app = express();


//mongoose
app.use(express.json());
mongoose.connect(process.env.MONGO_CONNECTION,
    err => {
        if(err) throw err;
        console.log('connected to MongoDB')
    });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});


app.use(bodyParser.json(
    {
        verify: (req, res, buf, encoding) => {
            if (buf && buf.length) {
                req.rawBody = buf.toString(encoding || 'utf8');
            }
        },
    }
));

// Set port
const port = process.env.PORT || "1337";
app.set("port", port);

app.use('/', routes);

// Server
app.listen(port, () => console.log(`Server running on localhost:${port}`));
