import mongoose from "mongoose";

async function connectDB() {
  try {
    await mongoose.connect(process.env.DB_CONNECTION);
    console.log("DB connection successful");
  } catch (error) {
    console.log("DB connection failed");
  }
}

export default connectDB;
