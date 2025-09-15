import mongoose from "mongoose";
import {env} from "../config/env";
import {logger} from "../config/logger";

export async function connectDB() {
  try {
    await mongoose.connect(env.MONGODB_URI, {});
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error({error}, "Error connecting to MongoDB");
    process.exit(1);
  }

  mongoose.connection.on("connected", () => logger.info("Mongo connected"));
  mongoose.connection.on("error", (err) => logger.error({err}, "Mongo error"));
  mongoose.connection.on("disconnected", () =>
    logger.warn("Mongo disconnected")
  );
}
