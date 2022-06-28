const express = require("express");
const routes = require("./routes");
const bodyParser = require('body-parser');
require('dotenv').config();
// App
console.log(process.env.PUDO_URL)
const app = express();

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

// app.use('/', routes);

// Server
app.listen(port, () => console.log(`Server running on localhost:${port}`));
