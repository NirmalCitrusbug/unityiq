import {User} from "./auth";

export interface UserFilters {
  search?: string;
  role?: string;
  store?: string;
}

export interface UserTableItem extends User {
  key: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface UsersResponse {
  status: number;
  message: string;
  data: {
    users: User[];
    pagination: Pagination;
  };
}
