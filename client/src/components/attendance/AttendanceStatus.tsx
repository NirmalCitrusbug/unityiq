import React from 'react';
import { Card, Space, Typography, Badge } from 'antd';

const { Text } = Typography;

interface AttendanceStatusProps {
  isClockIn: boolean;
  lastClockInTime?: string;
  lastClockOutTime?: string;
}

export const AttendanceStatus: React.FC<AttendanceStatusProps> = ({
  isClockIn,
  lastClockInTime,
  lastClockOutTime,
}) => {
  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>Status: </Text>
          <Badge
            status={isClockIn ? 'success' : 'default'}
            text={isClockIn ? 'Clocked In' : 'Clocked Out'}
          />
        </div>
        {lastClockInTime && (
          <div>
            <Text strong>Last Clock In: </Text>
            <Text>{new Date(lastClockInTime).toLocaleString()}</Text>
          </div>
        )}
        {lastClockOutTime && (
          <div>
            <Text strong>Last Clock Out: </Text>
            <Text>{new Date(lastClockOutTime).toLocaleString()}</Text>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default AttendanceStatus;
