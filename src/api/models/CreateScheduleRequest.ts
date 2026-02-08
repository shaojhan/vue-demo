/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request schema for creating a schedule.
 */
export type CreateScheduleRequest = {
    /**
     * Title
     */
    title: string;
    /**
     * Description
     */
    description?: (string | null);
    /**
     * Location
     */
    location?: (string | null);
    /**
     * Start time
     */
    start_time: string;
    /**
     * End time
     */
    end_time: string;
    /**
     * Whether this is an all-day event
     */
    all_day?: boolean;
    /**
     * Timezone
     */
    timezone?: string;
    /**
     * Whether to sync to Google Calendar
     */
    sync_to_google?: boolean;
};

