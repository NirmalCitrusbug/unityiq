"use client";

import {Spin} from "antd";

export function LoadingSpinner() {
  return (
    <div
      style={{
        height: "100%",
        minHeight: "200px",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Spin size="large" />
    </div>
  );
}
