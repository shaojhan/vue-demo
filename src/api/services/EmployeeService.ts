/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssignEmployeeRequest } from '../models/AssignEmployeeRequest';
import type { AssignEmployeeResponse } from '../models/AssignEmployeeResponse';
import type { EmployeeListResponse } from '../models/EmployeeListResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class EmployeeService {
    /**
     * List Employees
     * List all employees with pagination (Admin only).
     * @param page 頁碼
     * @param size 每頁筆數
     * @returns EmployeeListResponse Successful Response
     * @throws ApiError
     */
    public static listEmployees(
        page: number = 1,
        size: number = 20,
    ): CancelablePromise<EmployeeListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/employees/',
            query: {
                'page': page,
                'size': size,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Assign a user as an employee (Admin only)
     * Assign an existing user as an employee.
     * Only administrators can perform this action.
     * @param requestBody
     * @returns AssignEmployeeResponse Successful Response
     * @throws ApiError
     */
    public static assignUserAsEmployee(
        requestBody: AssignEmployeeRequest,
    ): CancelablePromise<AssignEmployeeResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/employees/assign',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
