"use client";

import React, {useState} from "react";
import {Card, Input, Button, Typography, message} from "antd";
import {useAuth} from "@/context/AuthContext";
import {useRouter} from "next/navigation";

const {Title} = Typography;

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const {login} = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    if (pin.length !== 4) {
      message.error("Please enter a 4-digit PIN");
      return;
    }

    setLoading(true);
    try {
      await login(pin);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f0f2f5",
      }}
    >
      <Card style={{width: 300, textAlign: "center"}}>
        <Title level={3}>Login</Title>
        <Input.Password
          size="large"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="Enter 4-digit PIN"
          style={{marginBottom: 16}}
          onPressEnter={handleSubmit}
        />
        <Button
          type="primary"
          size="large"
          block
          onClick={handleSubmit}
          loading={loading}
        >
          Login
        </Button>
      </Card>
    </div>
  );
}
