import type {ErrorRequestHandler} from "express";
import {ApiError, sendResponse} from "@/utils";
import {HTTP_STATUS_CODE} from "@/utils/constant";
import {logger} from "@/config";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  logger.error({err, requestId: res.locals.requestId}, "Request error");

  const status =
    err instanceof ApiError
      ? err.statusCode
      : HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR;

  const message =
    err instanceof ApiError && err.expose
      ? err.message
      : "Internal Server Error";

  sendResponse({
    res,
    status,
    message,
    error: message,
    data: {
      requestId: res.locals.requestId,
    },
  });
};
