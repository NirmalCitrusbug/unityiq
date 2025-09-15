import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { pinoHttp } from "pino-http";
import { logger } from "./config";
import routes from "./api/routes";
import { requestContext, notFound, errorHandler } from "./api/middleware";
import { serveStaticFiles } from "@/utils/fileUpload";

const app = express();

// Serve static files
serveStaticFiles(app);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(pinoHttp({ logger }));
app.use(requestContext);

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
