/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Department } from './Department';
import type { RoleInfoResponse } from './RoleInfoResponse';
/**
 * Response schema for a successfully assigned employee.
 */
export type AssignEmployeeResponse = {
    /**
     * Employee database ID
     */
    id: number;
    /**
     * 員工編號
     */
    idno: string;
    /**
     * 部門
     */
    department: Department;
    /**
     * 使用者 UUID
     */
    user_id?: (string | null);
    /**
     * 角色資訊
     */
    role?: (RoleInfoResponse | null);
    /**
     * 建立時間
     */
    created_at?: (string | null);
};

