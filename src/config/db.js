import mongoose from "mongoose";

let retries = 0;
const MAX_RETRIES = 5;

async function connectDB() {
  try {
    await mongoose.connect(process.env.DB_CONNECTION);
    console.log("DB connection successful");
  } catch (error) {
    console.error("DB connection failed", error.message);
    process.exit(1);
  }
}

mongoose.connection.on("disconnected", async () => {
  if (retries < MAX_RETRIES) {
    retries++;
    console.log(
      `DB disconnected. Retrying attempt ${retries}/${MAX_RETRIES} in 3s...`
    );
    setTimeout(connectDB, 3000);
  } else {
    console.error("Max retries reached. Shutting down.");
    process.exit(1);
  }
});

mongoose.connection.on("connected", () => {
  retries = 0;
});

export default connectDB;
