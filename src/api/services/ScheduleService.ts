/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ConnectGoogleRequest } from '../models/ConnectGoogleRequest';
import type { CreateScheduleRequest } from '../models/CreateScheduleRequest';
import type { GoogleAuthUrlResponse } from '../models/GoogleAuthUrlResponse';
import type { GoogleCalendarListResponse } from '../models/GoogleCalendarListResponse';
import type { GoogleStatusResponse } from '../models/GoogleStatusResponse';
import type { ScheduleActionResponse } from '../models/ScheduleActionResponse';
import type { ScheduleListResponse } from '../models/ScheduleListResponse';
import type { ScheduleResponse } from '../models/ScheduleResponse';
import type { UpdateScheduleRequest } from '../models/UpdateScheduleRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ScheduleService {
    /**
     * Create Schedule
     * Create a new schedule. Only employees can create schedules.
     * @param requestBody
     * @returns ScheduleResponse Successful Response
     * @throws ApiError
     */
    public static createSchedule(
        requestBody: CreateScheduleRequest,
    ): CancelablePromise<ScheduleResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/schedules/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Schedules
     * List all schedules. Only employees can view schedules.
     * @param page Page number
     * @param size Page size
     * @param startFrom Filter schedules starting from this time
     * @param startTo Filter schedules starting before this time
     * @returns ScheduleListResponse Successful Response
     * @throws ApiError
     */
    public static listSchedules(
        page: number = 1,
        size: number = 20,
        startFrom?: (string | null),
        startTo?: (string | null),
    ): CancelablePromise<ScheduleListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/schedules/',
            query: {
                'page': page,
                'size': size,
                'start_from': startFrom,
                'start_to': startTo,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Google Status
     * Get Google Calendar connection status. Only admins can check status.
     * @returns GoogleStatusResponse Successful Response
     * @throws ApiError
     */
    public static getGoogleStatus(): CancelablePromise<GoogleStatusResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/schedules/google/status',
        });
    }
    /**
     * Get Google Auth Url
     * Get Google OAuth authorization URL.
     * Admin will be redirected to Google to grant Calendar access.
     * @returns GoogleAuthUrlResponse Successful Response
     * @throws ApiError
     */
    public static getGoogleAuthUrl(): CancelablePromise<GoogleAuthUrlResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/schedules/google/auth',
        });
    }
    /**
     * Google Oauth Callback
     * OAuth callback endpoint.
     * Google redirects here after user grants/denies access.
     * @param code Authorization code from Google
     * @param state State for CSRF protection
     * @param error Error from Google
     * @returns any Successful Response
     * @throws ApiError
     */
    public static googleOauthCallback(
        code: string,
        state: string,
        error?: (string | null),
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/schedules/google/callback',
            query: {
                'code': code,
                'state': state,
                'error': error,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Google Calendars
     * List available Google Calendars after OAuth authorization.
     * Used to select which calendar to sync with.
     * @param tokenId Temporary token ID from OAuth callback
     * @returns GoogleCalendarListResponse Successful Response
     * @throws ApiError
     */
    public static listGoogleCalendars(
        tokenId: string,
    ): CancelablePromise<GoogleCalendarListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/schedules/google/calendars',
            query: {
                'token_id': tokenId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Select Google Calendar
     * Select a Google Calendar and complete the connection.
     * This saves the OAuth tokens and calendar ID to the database.
     * @param calendarId
     * @param tokenId Temporary token ID from OAuth callback
     * @returns GoogleStatusResponse Successful Response
     * @throws ApiError
     */
    public static selectGoogleCalendar(
        calendarId: string,
        tokenId: string,
    ): CancelablePromise<GoogleStatusResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/schedules/google/calendars/{calendar_id}/select',
            path: {
                'calendar_id': calendarId,
            },
            query: {
                'token_id': tokenId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Connect Google
     * Connect Google Calendar. Only admins can configure.
     * @param requestBody
     * @returns GoogleStatusResponse Successful Response
     * @throws ApiError
     */
    public static connectGoogle(
        requestBody: ConnectGoogleRequest,
    ): CancelablePromise<GoogleStatusResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/schedules/google/connect',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Disconnect Google
     * Disconnect Google Calendar. Only admins can configure.
     * @returns ScheduleActionResponse Successful Response
     * @throws ApiError
     */
    public static disconnectGoogle(): CancelablePromise<ScheduleActionResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/schedules/google/disconnect',
        });
    }
    /**
     * Get Schedule
     * Get a single schedule detail. Only employees can view schedules.
     * @param scheduleId
     * @returns ScheduleResponse Successful Response
     * @throws ApiError
     */
    public static getSchedule(
        scheduleId: string,
    ): CancelablePromise<ScheduleResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/schedules/{schedule_id}',
            path: {
                'schedule_id': scheduleId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Schedule
     * Update a schedule. Only the creator can update.
     * @param scheduleId
     * @param requestBody
     * @returns ScheduleResponse Successful Response
     * @throws ApiError
     */
    public static updateSchedule(
        scheduleId: string,
        requestBody: UpdateScheduleRequest,
    ): CancelablePromise<ScheduleResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/schedules/{schedule_id}',
            path: {
                'schedule_id': scheduleId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Schedule
     * Delete a schedule. Only the creator can delete.
     * @param scheduleId
     * @returns ScheduleActionResponse Successful Response
     * @throws ApiError
     */
    public static deleteSchedule(
        scheduleId: string,
    ): CancelablePromise<ScheduleActionResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/schedules/{schedule_id}',
            path: {
                'schedule_id': scheduleId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Sync Schedule
     * Manually sync a schedule to Google Calendar. Only the creator can sync.
     * @param scheduleId
     * @returns ScheduleResponse Successful Response
     * @throws ApiError
     */
    public static syncSchedule(
        scheduleId: string,
    ): CancelablePromise<ScheduleResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/schedules/{schedule_id}/sync',
            path: {
                'schedule_id': scheduleId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
