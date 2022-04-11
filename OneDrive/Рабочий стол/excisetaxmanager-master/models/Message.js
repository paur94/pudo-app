const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Message = new Schema({
    shop: String,
    queua: String,
    channel: String,
    body: String,
    status: {
        type: String,
        default: "created"
    },
    created: {
        type: Date,
        default: Date.now
    },
    modified: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Message', Message);

