const express = require("express");
const cors = require('cors')
var cors_proxy = require('cors-anywhere');


var host = process.env.HOST || '0.0.0.0';
// Listen on a specific port via the PORT environment variable
var port1 = process.env.PORT || 1337;

cors_proxy.createServer({
    originWhitelist: [], // Allow all origins
    requireHeader: ['origin', 'x-requested-with'],
    removeHeaders: ['cookie', 'cookie2']
}).listen(port1, host, function() {
    console.log('Running CORS Anywhere on ' + host + ':' + port1);
});

const routes = require("./routes");
const bodyParser = require('body-parser');
require('dotenv').config();
const mongoose = require("mongoose");
// App
console.log(process.env.PUDO_URL)
const app = express();
app.use(cors())
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

app.use(routes);

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
