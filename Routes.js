const mongoose = require("mongoose");
const express = require('express');
const router = express.Router();
const UserModel = require('./Models/UserModel');
const MettingModel = require('./Models/MettingModel');
const bcrypt = require("bcrypt");
const auth = require('./Middleware');


router.post('/', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const User = await UserModel.findOne({ email });
        if (!name || !email || !password) {
            res.status(400).json({ msg: "fill the data" });
        } else if (User) {
            res.status(401).json({ msg: "User already exit" });
        } else {
            const data = new UserModel({ name, email, password });
            await data.save();
            res.status(200).json({ msg: "successfully signin" });
        }
    } catch (err) {
        console.log(err);
    }
});


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const User = await UserModel.findOne({ email });
        if (!email || !password) {
            res.status(400).json({ msg: "fill the data" });
        } else if (User) {
            const check = bcrypt.compare(password, User.password);
            if (check) {
                const token = await User.addToken();
                res.cookie("JWTOKEN", token, {
                    httpOnly: true,
                    expires: new Date(Date.now() + 22324423542),
                });
                res.status(200).json({ msg: "successfully login" });
            } else {
                res.status(400).json({ msg: "User does not exit" })
            }
        }
    } catch (err) {
        console.log(err);
    }
});


router.get('/hidden', auth, (req, res) => {
    res.status(200).send(req.User);
});

router.post('/metting', async (req, res) => {
    try {
        const { _id, create } = req.body;
        const User = await MettingModel.findOne({ Admin: _id });
        const exit = await MettingModel.findOne({ videoID: create });
        if (!User && !exit) {
            const metting = new MettingModel({ Admin: _id, videoID: create, users: [_id] });
            const data = await metting.save();
            res.status(200).json({ msg: "successfully" });
        } else if (!User && exit) {
            res.status(202).json({ msg: "choose another mettingId" });
        }
        else {
            res.status(201).json({ msg: User.videoID });
        }
    } catch (err) {
        console.log(err);
    }
});

router.get("/join/:_id/:inputData", async (req, res) => {
    try {
        const { _id, inputData } = req.params;
        const User = await MettingModel.findOne({ videoID: inputData, users: { $elemMatch: { $eq: _id } } })
        const User1 = await MettingModel.findOne({ videoID: inputData }).populate('Admin', '_id');
        if (User) {
            return res.status(200).send(User);
        } else if (User1) {
            return res.status(201).send(User1);
        }
        return res.status(400).json({ msg: "not found" });
    } catch (err) {
        console.log(err);
    }
});


router.get('/check/:roomID/:permit', auth, async (req, res) => {
    try {
        const { roomID, permit } = req.params;
        const res1 = await MettingModel.findOne({ videoID: roomID });
        const isExit = await MettingModel.findOne({ videoID: roomID, users: { $elemMatch: { $eq: req.User._id } } });
        if (!res1) {
            return res.status(401).send({ msg: "not found" });
        } else if (isExit) {
            return res.status(200).send(req.User);
        } else if (permit === 'true') {
            const data = await MettingModel.findByIdAndUpdate(res1._id,
                {
                    $push: { users: req.User._id },
                },
                { new: true }
            );
            return res.status(201).send(req.User);
        } else {
            console.log('hello')
            return res.status(401).send({ msg: "not found" });
        }
    } catch (err) {
        console.log(err);
    }
})




module.exports = router;
