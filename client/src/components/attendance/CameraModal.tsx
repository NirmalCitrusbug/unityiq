import React, { useRef, useState, useEffect } from "react";
import { Modal, Button, Space } from "antd";
import { CameraOutlined, CloseCircleOutlined } from "@ant-design/icons";
import Webcam from "react-webcam";
import LocationInfo from "./LocationInfo";
import { Store } from "@/types";
import { Location } from "@/types/attendance";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageSrc: string) => void;
  hasCamera: boolean | null;
  cameraPermission: string | null;
  isWithinRange: boolean;
  currentLocation: Location | null;
  distanceFromStore: number | null;
  currentStore: {
    location: {
      coordinates: [number, number];
    };
  } | null;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  hasCamera,
  cameraPermission,
  isWithinRange,
  currentLocation,
  distanceFromStore,
  currentStore,
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  return (
    <Modal
      title="Take a Photo"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnHidden
    >
      <div style={{ textAlign: "center" }}>
        {!hasCamera ? (
          <div>No camera found on this device.</div>
        ) : cameraPermission === "denied" ? (
          <div>
            Camera permission denied. Please enable camera access in your
            browser settings.
          </div>
        ) : (
          <>
            <LocationInfo
              isWithinRange={isWithinRange}
              currentLocation={currentLocation}
              distanceFromStore={distanceFromStore}
              currentStore={currentStore}
            />
            {!capturedImage ? (
              <div style={{ marginBottom: 16 }}>
                {isOpen && !capturedImage && (
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      width: 540,
                      height: 380,
                      facingMode: "user",
                    }}
                    mirrored={true}
                    style={{ width: "100%", maxWidth: 540, maxHeight: 380 }}
                  />
                )}

                <div style={{ marginTop: 16 }}>
                  <Button
                    type="primary"
                    icon={<CameraOutlined />}
                    onClick={capturePhoto}
                  >
                    Take Photo
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: 16 }}>
                <img
                  src={capturedImage}
                  alt="Captured"
                  style={{ maxWidth: "100%", maxHeight: 400 }}
                />
                <div style={{ marginTop: 16 }}>
                  <Space>
                    <Button onClick={handleRetake}>Retake</Button>
                    <Button type="primary" onClick={handleConfirm}>
                      Confirm
                    </Button>
                  </Space>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

export default CameraModal;
