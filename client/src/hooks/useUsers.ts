"use client";

import { useState, useCallback } from "react";
import { message } from "antd";
import { usersService } from "@/services/users";
import { User } from "@/types/auth";

export const useUsers = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchUsers = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      try {
        const response = await usersService.getUsers(page, pageSize);
        setUsers(response.data.users);
        setTotal(response.data.pagination.total);
        setCurrentPage(response.data.pagination.page);
      } catch (error) {
        message.error("Failed to fetch users");
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  const handleDelete = async (userId: string) => {
    try {
      await usersService.deleteUser(userId);
      message.success("User deleted successfully");
      fetchUsers(currentPage);
    } catch (error) {
      message.error("Failed to delete user");
      console.error("Error deleting user:", error);
    }
  };

  const handlePageChange = (page: number, newPageSize?: number) => {
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
    }
    fetchUsers(page);
  };

  return {
    users,
    total,
    loading,
    currentPage,
    pageSize,
    fetchUsers,
    handleDelete,
    handlePageChange,
  };
};
