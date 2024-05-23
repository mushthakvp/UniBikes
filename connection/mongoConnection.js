const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true, 
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`.magenta);
  } catch (error) {
    console.log(`MongoDB Not connected ${error}`.red);
    process.exit(1);
  }
};

module.exports = connectDB;
