/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request schema for connecting Google Calendar.
 */
export type ConnectGoogleRequest = {
    /**
     * Google Calendar ID
     */
    calendar_id: string;
    /**
     * OAuth access token
     */
    access_token: string;
    /**
     * OAuth refresh token
     */
    refresh_token: string;
    /**
     * Token expiration time
     */
    expires_at: string;
};

