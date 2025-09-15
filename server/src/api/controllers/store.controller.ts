import type {Request, Response} from "express";
import {storeService} from "@/api/services/store.service";
import {asyncHandler, sendResponse} from "@/utils";
import {HTTP_STATUS_CODE} from "@/utils/constant";

export const storeController = {
  getById: asyncHandler(async (req: Request, res: Response) => {
    const { storeId } = req.params;
    
    // Prevent caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    const store = await storeService.getById(storeId);

    sendResponse({
      res,
      status: HTTP_STATUS_CODE.OK,
      message: "Store retrieved successfully",
      data: store,
    });
  }),

  getAll: asyncHandler(async (req: Request, res: Response) => {
    const {isActive, brandId, search} = req.query;

    const stores = await storeService.getAll({
      isActive: isActive as boolean | undefined,
      brandId: brandId as string | undefined,
      search: search as string | undefined,
    });

    sendResponse({
      res,
      status: HTTP_STATUS_CODE.OK,
      message: "Stores retrieved successfully",
      data: stores,
    });
  }),
  updateLocation: asyncHandler(async (req: Request, res: Response) => {
    const {storeId} = req.params;
    const {latitude, longitude, geofenceRadius} = req.body;

    const store = await storeService.updateLocation({
      storeId,
      latitude,
      longitude,
      geofenceRadius,
    });

    sendResponse({
      res,
      status: HTTP_STATUS_CODE.OK,
      message: "Store location updated successfully",
      data: store,
    });
  }),
};
