const mongoose = require("mongoose");
const mongoURI = "mongodb://127.0.0.1:27017/inotebook?directConnection=true&tls=false&readPreference=primary";

const connectToMongo = () => {
    mongoose.connect(mongoURI);
    console.log("connected to mongoose successfully");
}

module.exports = connectToMongo;