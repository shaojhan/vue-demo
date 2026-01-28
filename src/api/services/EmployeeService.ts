/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssignEmployeeRequest } from '../models/AssignEmployeeRequest';
import type { AssignEmployeeResponse } from '../models/AssignEmployeeResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class EmployeeService {
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
