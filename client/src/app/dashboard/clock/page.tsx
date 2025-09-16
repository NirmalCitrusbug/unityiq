"use client";

import React, { useEffect, useState } from "react";
import { Button, Typography, Space, Alert } from "antd";
import { CameraOutlined } from "@ant-design/icons";
import { useAuth } from "@/context/AuthContext";
import { useAttendance } from "@/hooks/useAttendance";
import {
  AttendanceStatus,
  LocationInfo,
  CameraModal,
} from "@/components/attendance";
import { Store } from "@/types";

const { Title } = Typography;

export default function ClockPage() {
  const { user } = useAuth();
  const {
    currentLocation,
    isWithinRange,
    attendanceStatus,
    currentStore,
    handleClockIn,
    handleClockOut,
    distanceFromStore,
    loading,
    checkLocation,
  } = useAttendance(user?.id || "");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [cameraPermission, setCameraPermission] =
    useState<PermissionState | null>(null);

  useEffect(() => {
    const checkCameraAvailability = async () => {
      if (!navigator.mediaDevices?.enumerateDevices) {
        setHasCamera(false);
        return;
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        setHasCamera(videoDevices.length > 0);
      } catch (error) {
        console.error("Error checking camera devices:", error);
        setHasCamera(false);
      }
    };

    const checkPermission = async () => {
      try {
        const permissionStatus = await navigator.permissions.query({
          name: "camera" as PermissionName,
        });
        setCameraPermission(permissionStatus.state);

        permissionStatus.onchange = () => {
          setCameraPermission(permissionStatus.state);
        };
      } catch (error) {
        console.error("Error checking camera permission:", error);
      }
    };

    checkCameraAvailability();
    checkPermission();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleOpenModal = async () => {
    try {
      setIsOpening(true);
      const locationCheck = await checkLocation();
      console.log("Location check:", locationCheck);
      setIsModalOpen((prev) => !prev);
      setIsOpening(false);
    } catch (error) {
      setIsOpening(false);
      console.error("Error checking location:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  const handleCapture = async (imageSrc: string) => {
    const dataURLtoFile = (dataurl: string, filename: string) => {
      const arr = dataurl.split(",");
      const mime = arr[0].match(/:(.*?);/)?.[1];
      const bstr = atob(arr[1]);
      const u8arr = new Uint8Array(bstr.length);

      for (let i = 0; i < bstr.length; i++) {
        u8arr[i] = bstr.charCodeAt(i);
      }

      return new File([u8arr], filename, { type: mime });
    };

    const imageFile = dataURLtoFile(imageSrc, "clockin-photo.jpg");
    await handleClockIn(imageFile);
  };

  return (
    <div>
      <Title level={2}>Attendance</Title>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <AttendanceStatus
          isClockIn={attendanceStatus.isClockIn}
          lastClockInTime={attendanceStatus.currentAttendance?.clockIn?.time}
          lastClockOutTime={attendanceStatus.currentAttendance?.clockOut?.time}
        />

        {!isWithinRange && currentStore && (
          <Alert
            message="Out of Range"
            description="You must be within the store's range to clock in or out."
            type="warning"
            showIcon
          />
        )}

        <Space size="middle">
          <Button
            type="primary"
            onClick={handleOpenModal}
            disabled={attendanceStatus.isClockIn}
            loading={loading || isOpening}
            icon={<CameraOutlined />}
          >
            Clock In
          </Button>
          <Button
            type="primary"
            danger
            onClick={handleClockOut}
            disabled={!attendanceStatus.isClockIn}
            loading={loading}
          >
            Clock Out
          </Button>
        </Space>

        <CameraModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onCapture={handleCapture}
          hasCamera={hasCamera}
          cameraPermission={cameraPermission}
          currentLocation={currentLocation}
          distanceFromStore={distanceFromStore}
          isWithinRange={isWithinRange}
          currentStore={currentStore}
          checkLocation={checkLocation}
        />

        {hasCamera === false && (
          <Alert
            message="No camera found on this device"
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
        {cameraPermission === "denied" && (
          <Alert
            message="Camera permission denied. Please enable camera access in your browser settings."
            type="error"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Space>
    </div>
  );
}
