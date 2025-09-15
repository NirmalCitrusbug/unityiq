"use client";

import React, { useEffect } from "react";
import { Table, Space, Button, Popconfirm, Input } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useUsers } from "@/hooks";
import { useAuth } from "@/context";
import { User, UserTableItem } from "@/types";

const { Search } = Input;

export default function UsersTable() {
  const {
    users,
    total,
    loading,
    currentPage,
    pageSize,
    fetchUsers,
    handleDelete,
    handlePageChange,
  } = useUsers();

  const { checkPermission } = useAuth();
  const canDelete = checkPermission("users", "delete");
  const canUpdate = checkPermission("users", "update");

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (value: string) => {
    fetchUsers(1);
  };

  const columns = [
    {
      title: "Name",
      key: "name",
      render: (record: User) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: ["roleId", "name"],
      key: "role",
    },
    {
      title: "Status",
      key: "status",
      render: (record: User) => record.isActive ? 'Active' : 'Inactive',
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: UserTableItem) => (
        <Space>
          {canUpdate && (
            <Button
              icon={<EditOutlined />}
              type="link"
              onClick={() => console.log("Edit user:", record.id)}
            />
          )}
          {canDelete && (
            <Popconfirm
              title="Delete user"
              description="Are you sure you want to delete this user?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button icon={<DeleteOutlined />} type="link" danger />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const tableData = users.map((user) => ({
    ...user,
    key: user.id,
  }));

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="Search users..."
          allowClear
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={tableData}
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          onChange: handlePageChange,
          showSizeChanger: true,
        }}
      />
    </div>
  );
}
