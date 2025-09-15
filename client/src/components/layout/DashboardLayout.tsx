"use client";

import React, {Suspense} from "react";
import {Layout, Menu, Button, Space, Typography} from "antd";
import {useAuth} from "@/context";
import {
  TeamOutlined,
  ClockCircleOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import {LoadingSpinner} from "@/components/common/LoadingSpinner";
import Link from "next/link";

const {Header, Sider, Content} = Layout;
const {Text} = Typography;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {user, logout, checkPermission} = useAuth();

  const menuItems = [
    ...(checkPermission("users", "read")
      ? [
          {
            key: "users",
            icon: <TeamOutlined />,
            label: <Link href="/dashboard/users">Users</Link>,
          },
        ]
      : []),
    {
      key: "clock",
      icon: <ClockCircleOutlined />,
      label: <Link href="/dashboard/clock">Clock In/Out</Link>,
    },
    ...(checkPermission("users", "read")
      ? [
          {
            key: "attendance-report",
            icon: <ClockCircleOutlined />,
            label: <Link href="/dashboard/attendance">Attendance Report</Link>,
          },
        ]
      : []),
  ];

  return (
    <Layout style={{minHeight: "100vh"}}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{padding: "16px", textAlign: "center"}}>
          <Text strong style={{color: "white"}}>
            UnityIQ
          </Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{padding: "0 16px", background: "#fff"}}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Space>
              <span>
                {user?.firstName} {user?.lastName} ({user?.role.name})
              </span>
              <Button
                icon={<LogoutOutlined />}
                onClick={logout}
                type="text"
                danger
              >
                Logout
              </Button>
            </Space>
          </div>
        </Header>
        <Content style={{margin: "24px 16px", padding: 24, background: "#fff"}}>
          <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
        </Content>
      </Layout>
    </Layout>
  );
}
