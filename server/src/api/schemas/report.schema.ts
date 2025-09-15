import { z } from 'zod';

export const attendanceReportSchema = z.object({
  query: z.object({
    userId: z.string().optional(),
    storeId: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    status: z.enum(['ACTIVE', 'COMPLETED']).optional(),
    format: z.enum(['json', 'csv']).default('json'),
  }),
});

export type AttendanceReportQuery = z.infer<typeof attendanceReportSchema>['query'];
