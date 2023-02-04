const mongoose = require('mongoose');
mongoose.set("strictQuery", false);
mongoose.connect(process.env.DATA_BASE)
    .then(() => console.log('connect....')).catch((err) => console.log('not connect'));