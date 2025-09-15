"use client";

import React, {Suspense} from "react";
import {Typography} from "antd";
import UsersTable from "@/components/users/UsersTable";
import {useAuth} from "@/context/AuthContext";
import {LoadingSpinner} from "@/components/common/LoadingSpinner";

const {Title} = Typography;

export default function UsersPage() {
  const {checkPermission} = useAuth();

  if (!checkPermission("users", "read")) {
    return <div>You don&apos;t have permission to view this page.</div>;
  }

  return (
    <div>
      <Title level={2}>Users Management</Title>
      <Suspense fallback={<LoadingSpinner />}>
        <UsersTable />
      </Suspense>
    </div>
  );
}
