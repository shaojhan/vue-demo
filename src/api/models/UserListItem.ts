/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserRole } from './UserRole';
/**
 * Item in user list response.
 */
export type UserListItem = {
    id: string;
    uid: string;
    email: string;
    role: UserRole;
    email_verified: boolean;
    created_at?: (string | null);
};

