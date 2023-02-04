const mongoose = require('mongoose');

const mongooseSchema = new mongoose.Schema({
    Admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
        unique: true
    },
    videoID: {
        type: String,
        require: true,
        unique: true
    },
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
}, {
    timestamps: true
});

const mongooseModel = mongoose.model('metting', mongooseSchema);

module.exports = mongooseModel;