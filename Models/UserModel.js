const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");


const mongooseSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        unique: true,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    token: {
        type: String
    }
}, {
    timestamps: true
});


mongooseSchema.pre('save', async function (next) {
    try {
        if (this.isModified('password')) {
            this.password = await bcrypt.hash(this.password, 12);
        }
        next();
    } catch (err) {
        console.log(err)
    }
});

mongooseSchema.methods.addToken = async function(){
    try {
        const token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
        this.token = token;
        await this.save();
        return token;
    } catch (err) {
        console.log(err);
    }
}

const mongooseModel = mongoose.model('User', mongooseSchema);

module.exports = mongooseModel;