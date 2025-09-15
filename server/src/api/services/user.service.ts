import {User} from "@/models";
import {ApiError} from "@/utils";
import {logger} from "@/config";

interface GetUsersQuery {
  isActive?: boolean;
  roleId?: string;
  storeId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

class UserService {
  /**
   * Get list of users with pagination and filters
   */
  async getUsers(query: GetUsersQuery = {}) {
    try {
      const {isActive, roleId, storeId, search, page = 1, limit = 10} = query;

      const filter: any = {};

      // Filter by active status
      if (isActive !== undefined) {
        filter.isActive = isActive;
      }

      // Filter by role
      if (roleId) {
        filter.roleId = roleId;
      }

      // Filter by store
      if (storeId) {
        filter.storeIds = storeId;
      }

      // Search in name and email
      if (search) {
        const searchRegex = new RegExp(search, "i");
        filter.$or = [
          {firstName: searchRegex},
          {lastName: searchRegex},
          {email: searchRegex},
        ];
      }

      // Calculate skip for pagination
      const skip = (page - 1) * limit;

      // Get total count for pagination
      const total = await User.countDocuments(filter);

      // Get users with pagination and populate references
      const users = await User.find(filter)
        .populate("roleId", "name permissions")
        .populate("storeIds", "name locationId")
        .populate("storeIds.locationId", "name address city")
        .select("-pin") // Exclude sensitive data
        .sort({firstName: 1, lastName: 1})
        .skip(skip)
        .limit(limit);

      return {
        users,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error({error}, "Failed to fetch users");
      throw error;
    }
  }
}

export const userService = new UserService();
