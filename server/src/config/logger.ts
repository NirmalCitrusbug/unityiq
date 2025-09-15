import pino from "pino";
import {env} from "./env";

const loggerOptions: pino.LoggerOptions = {
  level: env.NODE_ENV === "production" ? "info" : "debug",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: "yyyy-mm-dd HH:MM:ss",
      ignore: "pid,hostname",
      messageFormat: "{msg} {context}",
      errorProps: "*",
    },
  },
};

export const logger = pino(loggerOptions);
