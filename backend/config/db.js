const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("Missing MONGO_URI in backend/.env — see backend/.env.example");
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log("MongoDB connected");
}

module.exports = connectDB;
