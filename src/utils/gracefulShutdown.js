import mongoose from "mongoose";

function gracefulShutdown(server, signal) {
  console.log(`Received ${signal}, Shutting down server gracefully`);

  server.close(async () => {
    console.log("HTTP server close. No new request will be accepted");

    await mongoose.connection.close();
    console.log("Mongodb connection close");

    process.exit(0);
  });

  setTimeout(() => {
    console.error("Forcing shutdown — took too long.");
    process.exit(1);
  }, 10000);
}

export default gracefulShutdown;
