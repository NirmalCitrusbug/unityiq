/**
 * Utility for sending standardized API responses
 * @module utils/response
 */

import {Response} from "express";

/**
 * Parameters for sending a response
 * @template T
 * @interface SendResponseParams
 */
interface SendResponseParams<T = any> {
  res: Response;
  status: number;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Sends a standardized JSON response
 * @template T
 * @param {SendResponseParams<T>} params - The response parameters
 * @returns {void}
 */
export function sendResponse<T>({
  res,
  status,
  message,
  data,
  error,
}: SendResponseParams<T>): void {
  res.status(status).json({
    status,
    message,
    data,
    error,
  });
}
