/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request schema for updating a schedule.
 */
export type UpdateScheduleRequest = {
    /**
     * Title
     */
    title?: (string | null);
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
    start_time?: (string | null);
    /**
     * End time
     */
    end_time?: (string | null);
    /**
     * Whether this is an all-day event
     */
    all_day?: (boolean | null);
    /**
     * Timezone
     */
    timezone?: (string | null);
    /**
     * Whether to sync to Google Calendar
     */
    sync_to_google?: boolean;
};

