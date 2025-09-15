import React from 'react';
import { Card, Space, Typography, Badge } from 'antd';

const { Text } = Typography;

interface LocationInfoProps {
  isWithinRange: boolean;
  currentLocation: {
    latitude: number;
    longitude: number;
  } | null;
  distanceFromStore: number | null;
  currentStore: {
    location: {
      coordinates: [number, number];
    };
  } | null;
}

export const LocationInfo: React.FC<LocationInfoProps> = ({
  isWithinRange,
  currentLocation,
  distanceFromStore,
  currentStore,
}) => {
  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>Location Status: </Text>
          <Badge
            status={isWithinRange ? 'success' : 'error'}
            text={isWithinRange ? 'Within Range' : 'Out of Range'}
          />
        </div>
        {currentLocation && (
          <>
            <div>
              <Text strong>Current Location: </Text>
              <Text>
                {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </Text>
            </div>
            {distanceFromStore !== null && (
              <div>
                <Text strong>Distance from Store: </Text>
                <Text>{distanceFromStore.toFixed(2)} meters</Text>
              </div>
            )}
          </>
        )}
        {currentStore && (
          <div>
            <Text strong>Store Location: </Text>
            <Text>
              {currentStore.location.coordinates[1].toFixed(6)}, {currentStore.location.coordinates[0].toFixed(6)}
            </Text>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default LocationInfo;
