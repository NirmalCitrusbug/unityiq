"use client";

import {useAuth} from "@/context/AuthContext";
import {Spin} from "antd";
import {useRouter} from "next/navigation";
import {useEffect} from "react";

export default function Home() {
  const {isAuthenticated} = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/auth");
    }
  }, [isAuthenticated, router]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Spin size="large" />
    </div>
  );
}
