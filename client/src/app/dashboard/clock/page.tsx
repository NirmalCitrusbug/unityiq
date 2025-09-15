"use client";

import React, { useRef, useState } from "react";
import { Button, Card, Typography, Space, Badge, Alert, Modal } from "antd";
import { useAuth } from "@/context/AuthContext";
import { useAttendance } from "@/hooks/useAttendance";
import Webcam from "react-webcam";


const { Title, Text } = Typography;

export default function ClockPage() {
  const { user } = useAuth();
  const {
    currentLocation,
    isWithinRange,
    loading,
    attendanceStatus,
    currentStore,
    handleClockIn,
    handleClockOut,
    checkLocation,
    distanceFromStore,
  } = useAttendance(user?.id || "");

  const webcamRef = useRef<Webcam>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  };

  const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

  const confirmClockIn = async () => {
    if (capturedImage) {
      const imageFile = dataURLtoFile(capturedImage, 'clockin-photo.jpg');
      await handleClockIn(imageFile);
      setIsModalOpen(false);
      setCapturedImage(null);
    }
  };


  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Title level={2}>Attendance</Title>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Card>
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <Text strong>Status: </Text>
              <Badge
                status={attendanceStatus.isClockIn ? "success" : "default"}
                text={attendanceStatus.isClockIn ? "Clocked In" : "Clocked Out"}
              />
            </div>
          </Space>
        </Card>

        <Card>
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <Text strong>Location Status: </Text>
              <Badge
                status={isWithinRange ? "success" : "error"}
                text={isWithinRange ? "Within Range" : "Out of Range"}
              />
            </div>
            {currentLocation && (
              <>
                <div>
                  <Text strong>Current Location: </Text>
                  <Text>
                    {currentLocation.latitude.toFixed(6)},{" "}
                    {currentLocation.longitude.toFixed(6)}
                  </Text>
                </div>
                {distanceFromStore !== null && (
                  <div>
                    <Text strong>Distance from Store: </Text>
                    <Text>
                      {distanceFromStore > 1000
                        ? `${(distanceFromStore / 1000).toFixed(2)} km`
                        : `${Math.round(distanceFromStore)} meters`}{" "}
                      <Text type={isWithinRange ? "success" : "danger"}>
                        (
                        {isWithinRange
                          ? "Within range"
                          : currentStore
                            ? `${Math.round(
                              currentStore.geofenceRadius - distanceFromStore
                            )} meters too far`
                            : 'Out of range'}
                        )
                      </Text>
                    </Text>
                  </div>
                )}
                <Button type="link" onClick={checkLocation}>
                  Refresh Location
                </Button>
              </>
            )}
          </Space>
        </Card>

        {!isWithinRange && (
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
            size="large"
            onClick={() => setIsModalOpen(true)} // open webcam modal
            loading={loading}
            disabled={attendanceStatus.isClockIn || !currentStore}
          >
            Clock In
          </Button>
          <Button
            danger
            size="large"
            onClick={handleClockOut}
            loading={loading}
            disabled={!attendanceStatus.isClockIn || !currentStore}
          >
            Clock Out
          </Button>
        </Space>
      </Space>

      {/* Webcam Modal */}
      <Modal
        open={isModalOpen}
        title="Capture Photo for Clock In"
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        {!capturedImage ? (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width="100%"
              videoConstraints={{ facingMode: "environment" }}
              imageSmoothing={false}
              mirrored={true}
            />
            <Button
              type="primary"
              block
              style={{ marginTop: "10px" }}
              onClick={capturePhoto}
            >
              Capture Photo
            </Button>
          </>
        ) : (
          <>
            <img src={capturedImage} alt="Captured" style={{ width: "100%" }} />
            <Space style={{ marginTop: "10px" }}>
              <Button onClick={() => setCapturedImage(null)}>Retake</Button>
              <Button type="primary" onClick={confirmClockIn}>
                Confirm & Clock In
              </Button>
            </Space>
          </>
        )}
      </Modal>
    </div>
  );
}
