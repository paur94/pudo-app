const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
const saltRounds = 10;

// User
const User = new Schema({
    username: {
        type: String,
        unique: true,
        lowercase:true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        lowercase:true,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    hashedPassword: {
        type: String,
        required: true,
        select: false
    },
    created: {
        type: Date,
        default: Date.now
    },
    shop:String
});

User.methods.encryptPassword = function (password) {
    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(password, salt);
    //more secure - return crypto.pbkdf2Sync(password, this.salt, 10000, 512);
};

User.virtual('userId')
    .get(function () {
        return this.id;
    });

User.virtual('password')
    .set(function (password) {
        this._plainPassword = password;
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function () { return this._plainPassword; });


User.methods.checkPassword = function (password) {
    return bcrypt.compareSync(password, this.hashedPassword);
};

User.methods.resetPassword = function (password) {
    this.hashedPassword = this.encryptPassword(password);   
};

module.exports = mongoose.model('User', User);