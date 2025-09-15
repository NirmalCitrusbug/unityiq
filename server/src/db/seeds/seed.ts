import {connectDB} from "../connect";
import {seedDatabase} from "./initial.seed";
import {logger} from "@/config";

async function runSeed() {
  try {
    await connectDB();
    await seedDatabase();
    process.exit(0);
  } catch (error) {
    logger.error({error}, "Error running seed");
    process.exit(1);
  }
}

runSeed();
