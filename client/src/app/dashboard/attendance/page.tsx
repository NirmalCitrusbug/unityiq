"use client";

import React, { Suspense } from "react";
import { Typography } from "antd";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import AttendanceList from "@/components/attendance/AttendanceList";
import { useAuth } from "@/context/AuthContext";

const { Title } = Typography;

export default function AttendancePage() {
  const { checkPermission } = useAuth();

  if (!checkPermission("users", "read")) {
    return <div>You don&apos;t have permission to view this page.</div>;
  }

  return (
    <div>
      <Title level={2}>Attendance Report</Title>
      <Suspense fallback={<LoadingSpinner />}>
        <AttendanceList />
      </Suspense>
    </div>
  );
}
