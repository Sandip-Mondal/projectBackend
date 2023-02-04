const mongoose = require('mongoose');
mongoose.set("strictQuery", false);
mongoose.connect(process.env.DATA_BASE)
    .then().catch((err) => console.log('not connect'));