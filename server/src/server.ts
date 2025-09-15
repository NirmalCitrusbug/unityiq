import {createServer} from "http";
import app from "./app";
import {logger, env} from "./config";
import {connectDB} from "./db/connect";

(async () => {
  await connectDB();
  const server = createServer(app);
  server.listen(env.PORT, () => {
    logger.info({port: env.PORT, env: env.NODE_ENV}, "HTTP server started");
  });
})();
