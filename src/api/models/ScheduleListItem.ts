/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ScheduleCreatorResponse } from './ScheduleCreatorResponse';
/**
 * Schedule list item.
 */
export type ScheduleListItem = {
    id: string;
    title: string;
    description?: (string | null);
    location?: (string | null);
    start_time: string;
    end_time: string;
    all_day: boolean;
    creator?: (ScheduleCreatorResponse | null);
    is_synced?: boolean;
    created_at: string;
};

