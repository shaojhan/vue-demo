/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Department } from './Department';
import type { RoleInfoResponse } from './RoleInfoResponse';
/**
 * Item in employee list response.
 */
export type EmployeeListItem = {
    id: number;
    idno: string;
    department: Department;
    user_id?: (string | null);
    role?: (RoleInfoResponse | null);
    created_at?: (string | null);
};

