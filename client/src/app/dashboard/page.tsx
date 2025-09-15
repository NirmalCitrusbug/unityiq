"use client";

import React from "react";
import {Typography} from "antd";
import {useAuth} from "@/context/AuthContext";

const {Title} = Typography;

export default function DashboardPage() {
  const {user} = useAuth();

  return (
    <div>
      <Title level={2}>Welcome, {user?.firstName}!</Title>
      <p>Select an option from the sidebar to get started.</p>
    </div>
  );
}
