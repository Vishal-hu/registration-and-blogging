const mongoose = require("mongoose");
//mongodb://127.0.0.1:27017/registrationUser"
mongoose
    .connect("mongodb+srv://Vishal:Vishal@12345@cluster0.xmemq.mongodb.net/registration?retryWrites=true&w=majority", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: true,
        useCreateIndex: true,
    })
    .then(() => {
        console.log("connection successful");
    })
    .catch((e) => {
        console.log("No connection");
    });