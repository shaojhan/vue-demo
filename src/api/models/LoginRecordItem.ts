/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Item in login record list response.
 */
export type LoginRecordItem = {
    id: string;
    user_id?: (string | null);
    username: string;
    ip_address: string;
    user_agent: string;
    success: boolean;
    failure_reason?: (string | null);
    created_at: string;
};

