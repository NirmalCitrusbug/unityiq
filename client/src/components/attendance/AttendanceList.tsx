"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, Typography, Pagination, Badge, Image, Tag, Space } from "antd";
import { reportService } from "@/services/reports";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

const { Text } = Typography;
dayjs.extend(relativeTime);

type Location = {
    type: string;
    coordinates: [number, number];
};

type ClockEvent = {
    time: string;
    location: Location;
    image?: string;
};

type AttendanceRecord = {
    // "id": "68c40bb1e715b93a8e396934",
    // "user": {
    //     "id": "68c2b4e08cbde82f2c51f1b6",
    //     "name": "Jane Smith",
    //     "email": "staff@example.com"
    // },
    // "store": {
    //     "id": "68c2b4e08cbde82f2c51f1b1",
    //     "brand": "Adidas",
    //     "location": "City Center",
    //     "address": "456 Market Street",
    //     "city": "Los Angeles",
    //     "state": "CA",
    //     "country": "USA"
    // },
    // "status": "ACTIVE",
    // "isWithinGeofence": "Yes",
    // "clockIn": {
    //     "time": "2025-09-12T12:01:53.233Z",
    //     "location": {
    //         "type": "Point",
    //         "coordinates": [
    //             72.5286052,
    //             23.0224126
    //         ]
    //     },
    //     "image": "http://localhost:8000/api/attendance/image/68c40bb1e715b93a8e396934"
    // },
    // "clockOut": null,
    // "duration": "0h 0.00m",
    // "locationStatus": "Within Geofence",
    // "createdAt": "2025-09-12T12:01:53.236Z",
    // "updatedAt": "2025-09-12T12:01:53.236Z"
    id: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    store: {
        id: string;
        brand: string;
        location: string;
        address: string;
        city: string;
        state: string;
        country: string;
    };
    status: string;
    isWithinGeofence: string;
    clockIn: ClockEvent;
    clockOut: ClockEvent;
    duration: string;
    locationStatus: string;
    createdAt: string;
    updatedAt: string;
};

type ApiResponse = {
    status: number;
    message: string;
    data: {
        data: AttendanceRecord[];
        included: {
            users: Array<{ id: string; email: string, name: string }>;
            stores: Array<{
                id: string;
                geofenceRadius: number;
                location: Location;
                brandId: string;
                locationId: string;
            }>;
            brands: Array<{ id: string; name: string }>;
            locations: Array<{
                id: string;
                name: string;
                address: string;
                city: string;
                state: string;
                country: string;
                postalCode: string;
            }>;
        };
    };
};

export default function AttendanceList() {
    const [loading, setLoading] = useState(true);
    const [attendanceData, setAttendanceData] = useState<{
        data: AttendanceRecord[];
        total: number;
        page: number;
        limit: number;
    }>({ data: [], total: 0, page: 1, limit: 10 });

    const fetchAttendance = useCallback(async (page: number = 1) => {
        try {
            setLoading(true);
            const response = await reportService.getAttendanceReport(
                page,
                attendanceData.limit
            ) as ApiResponse;

            const records = response?.data?.data || [];
            const included = response?.data?.included || {
                users: [],
                stores: [],
                brands: [],
                locations: []
            };

            const formattedData = records.map((record) => {
                const user = included.users.find((u) => u.id === record.user.id) || { email: 'Unknown', name: 'Unknown' };
                const store = included.stores.find((s) => s.id === record.store.id);
                // Remove unused brand variable since we're not using it
                const location = store ? included.locations.find((l) => l.id === store.locationId) : undefined;

                return {
                    ...record,
                    userName: user.name,
                    userEmail: user.email,
                    storeName: location?.name || 'Unknown Store',
                    storeAddress: location?.address || '',
                    clockInTime: record.clockIn.time,
                    clockOutTime: record.clockOut?.time || '',
                    clockInImage: record.clockIn.image || ''
                };
            });

            setAttendanceData(prev => ({
                data: formattedData,
                // Use the length of the returned records as total if not provided
                total: records.length,
                page,
                limit: prev.limit,
            }));
        } catch (error) {
            console.error("Failed to fetch attendance data:", error);
            setAttendanceData(prev => ({
                ...prev,
                data: [],
                total: 0
            }));
        } finally {
            setLoading(false);
        }
    }, [attendanceData.limit]);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    const getStatusBadge = (isWithinGeofence: 'Yes' | 'No') => {
        type StatusType = 'success' | 'warning' | 'default';
        const statusMap = {
            'Yes': { text: 'Within Geofence', color: 'success' as StatusType },
            'No': { text: 'Outside Geofence', color: 'warning' as StatusType },
        };

        const status = statusMap[isWithinGeofence] || { text: 'Unknown', color: 'default' as StatusType };
        return <Badge status={status.color} text={status.text} />;
    };

    const getStatusTag = (status: string) => {
        const statusMap = {
            'COMPLETED': { color: 'red', text: 'Completed' },
            'ACTIVE': { color: 'green', text: 'Active' },
        };

        const statusInfo = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
    };

    const formatDuration = (duration: string) => {
        if (!duration) return 'N/A';

        const matches = duration.match(/(\d+)h\s*([\d.]+)m/);
        if (matches) {
            const hours = parseInt(matches[1]);
            const minutes = parseFloat(matches[2]);
            const totalSeconds = Math.round((hours * 60 + minutes) * 60);
            const mins = Math.floor(totalSeconds / 60);
            const secs = totalSeconds % 60;
            return `${mins}m ${secs}s`;
        }
        return duration;
    };

    if (loading && attendanceData.data.length === 0) {
        return <div>Loading attendance data...</div>;
    }

    if (!loading && attendanceData.data.length === 0) {
        return <div>No attendance records found</div>;
    }

    return (
        <div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
            }}>
                {attendanceData.data.map((record) => (
                    <Card
                        key={record.id}
                        hoverable
                        style={{ height: '100%' }}
                        title={
                            <Space>
                                <Text strong>{record.user.name || 'Unknown User'}</Text>
                                {getStatusTag(record.status)}
                            </Space>
                        }
                    >
                        <div style={{ marginBottom: '16px' }}>
                            <Text type="secondary">{record.user.email || 'No email'}</Text>
                            <div style={{ marginTop: 4 }}>
                                {getStatusBadge(record.isWithinGeofence as 'Yes' | 'No')}
                            </div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <Text strong>Store: </Text>
                            <Text>{record.store.location || 'N/A'}</Text>
                            {record.store.address && (
                                <Text type="secondary" style={{ marginLeft: 8 }}>{record.store.address}</Text>
                            )}
                        </div>

                        <div style={{ marginBottom: '8px' }}>
                            <Text strong>Clock In: </Text>
                            <Text>{dayjs(record.clockIn?.time).format('MMM D, YYYY h:mm A')}</Text>
                            <Text type="secondary" style={{ marginLeft: '8px' }}>
                                ({dayjs(record.clockIn?.time).fromNow()})
                            </Text>
                        </div>

                        <div style={{ marginBottom: '8px' }}>
                            <Text strong>Clock Out: </Text>
                            {record.clockOut?.time ? (
                                <>
                                    <Text>{dayjs(record.clockOut?.time).format('MMM D, YYYY h:mm A')}</Text>
                                    <Text type="secondary" style={{ marginLeft: '8px' }}>
                                        ({dayjs(record.clockOut?.time).fromNow()})
                                    </Text>
                                </>
                            ) : (
                                <Text type="secondary">Not clocked out</Text>
                            )}
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <Text strong>Duration: </Text>
                            <Text>{formatDuration(record.duration)}</Text>
                        </div>

                        {record.clockIn?.image && (
                            <div style={{ marginTop: '16px', textAlign: 'center' }}>
                                <Image
                                    src={record.clockIn?.image}
                                    alt="Clock-in verification"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '200px',
                                        borderRadius: '4px',
                                        objectFit: 'cover'
                                    }}
                                    preview={false}
                                />
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                <Pagination
                    current={attendanceData.page}
                    total={attendanceData.total}
                    pageSize={attendanceData.limit}
                    onChange={(page) => {
                        fetchAttendance(page);
                        window.scrollTo(0, 0);
                    }}
                    showSizeChanger={false}
                />
            </div>
        </div>
    );
}
