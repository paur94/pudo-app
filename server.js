const express = require("express");
const routes = require("./routes");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
require('dotenv').config();
// App
console.log(process.env.PUDO_URL)
const app = express();


//mongoose
const { MONGO_CONNECTION } = process.env;
app.use(express.json());

mongoose.connect(MONGO_CONNECTION,
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  }
);

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
