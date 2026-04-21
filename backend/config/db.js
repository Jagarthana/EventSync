const mongoose = require("mongoose");

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set. Add it to backend/.env (e.g. mongodb://127.0.0.1:27017/eventsync)");
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected Successfully");
};

module.exports = connectDB;
