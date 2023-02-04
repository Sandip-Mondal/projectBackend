const jwt = require("jsonwebtoken");
const mongooseModel = require('./Models/UserModel');
const middleware = async (req, res, next) => {
    try {
        const token = req.cookies.JWTOKEN;
        const verify = jwt.verify(token, process.env.SECRET_KEY);
        const User = await mongooseModel.findOne({ _id: verify._id, token: token });
        if (!User) {
            throw new Error("invalid user!");
        }
        req.User = User;
        next();
    } catch (err) {
        res.status(400).json("inValid Here !");
        console.log(err.message);
    }
}


module.exports = middleware;