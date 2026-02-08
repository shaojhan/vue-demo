/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GoogleSyncResponse } from './GoogleSyncResponse';
import type { ScheduleCreatorResponse } from './ScheduleCreatorResponse';
/**
 * Single schedule response.
 */
export type ScheduleResponse = {
    id: string;
    title: string;
    description?: (string | null);
    location?: (string | null);
    start_time: string;
    end_time: string;
    all_day: boolean;
    timezone: string;
    creator?: (ScheduleCreatorResponse | null);
    google_sync: GoogleSyncResponse;
    created_at: string;
    updated_at?: (string | null);
};

