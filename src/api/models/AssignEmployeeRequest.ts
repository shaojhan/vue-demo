/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Department } from './Department';
/**
 * Request schema for assigning a user as an employee.
 */
export type AssignEmployeeRequest = {
    /**
     * 使用者 UUID
     */
    user_id: string;
    /**
     * 員工編號
     */
    idno: string;
    /**
     * 部門
     */
    department: Department;
    /**
     * 角色 ID
     */
    role_id: number;
};

