import type {Request, Response} from "express";
import {userService} from "@/api/services/user.service";
import {asyncHandler, sendResponse} from "@/utils";
import {HTTP_STATUS_CODE} from "@/utils/constant";

export const userController = {
  getUsers: asyncHandler(async (req: Request, res: Response) => {
    const {isActive, roleId, storeId, search, page, limit} = req.query;

    const result = await userService.getUsers({
      isActive: isActive as boolean | undefined,
      roleId: roleId as string,
      storeId: storeId as string,
      search: search as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    sendResponse({
      res,
      status: HTTP_STATUS_CODE.OK,
      message: "Users retrieved successfully",
      data: result,
    });
  }),
};
