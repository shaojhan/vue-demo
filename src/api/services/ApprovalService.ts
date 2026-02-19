/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovalListResponse } from '../models/ApprovalListResponse';
import type { ApprovalRequestResponse } from '../models/ApprovalRequestResponse';
import type { ApprovalStatus } from '../models/ApprovalStatus';
import type { ApproveRejectRequest } from '../models/ApproveRejectRequest';
import type { CreateExpenseRequest } from '../models/CreateExpenseRequest';
import type { CreateLeaveRequest } from '../models/CreateLeaveRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ApprovalService {
    /**
     * Create Leave Request
     * Create a leave approval request.
     * @param requestBody
     * @returns ApprovalRequestResponse Successful Response
     * @throws ApiError
     */
    public static createLeaveRequest(
        requestBody: CreateLeaveRequest,
    ): CancelablePromise<ApprovalRequestResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/approvals/leave',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Expense Request
     * Create an expense approval request.
     * @param requestBody
     * @returns ApprovalRequestResponse Successful Response
     * @throws ApiError
     */
    public static createExpenseRequest(
        requestBody: CreateExpenseRequest,
    ): CancelablePromise<ApprovalRequestResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/approvals/expense',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get My Requests
     * List my submitted approval requests.
     * @param page
     * @param size
     * @param status
     * @returns ApprovalListResponse Successful Response
     * @throws ApiError
     */
    public static getMyApprovalRequests(
        page: number = 1,
        size: number = 20,
        status?: (ApprovalStatus | null),
    ): CancelablePromise<ApprovalListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/approvals/my-requests',
            query: {
                'page': page,
                'size': size,
                'status': status,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Pending Approvals
     * List approval requests waiting for my approval.
     * @param page
     * @param size
     * @returns ApprovalListResponse Successful Response
     * @throws ApiError
     */
    public static getPendingApprovals(
        page: number = 1,
        size: number = 20,
    ): CancelablePromise<ApprovalListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/approvals/pending',
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
     * Get Request Detail
     * Get approval request detail with all steps.
     * @param requestId
     * @returns ApprovalRequestResponse Successful Response
     * @throws ApiError
     */
    public static getApprovalDetail(
        requestId: string,
    ): CancelablePromise<ApprovalRequestResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/approvals/{request_id}',
            path: {
                'request_id': requestId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Approve Request
     * Approve the current step of an approval request.
     * @param requestId
     * @param requestBody
     * @returns ApprovalRequestResponse Successful Response
     * @throws ApiError
     */
    public static approveRequest(
        requestId: string,
        requestBody: ApproveRejectRequest,
    ): CancelablePromise<ApprovalRequestResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/approvals/{request_id}/approve',
            path: {
                'request_id': requestId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Reject Request
     * Reject an approval request.
     * @param requestId
     * @param requestBody
     * @returns ApprovalRequestResponse Successful Response
     * @throws ApiError
     */
    public static rejectRequest(
        requestId: string,
        requestBody: ApproveRejectRequest,
    ): CancelablePromise<ApprovalRequestResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/approvals/{request_id}/reject',
            path: {
                'request_id': requestId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Cancel Request
     * Cancel own approval request.
     * @param requestId
     * @returns ApprovalRequestResponse Successful Response
     * @throws ApiError
     */
    public static cancelRequest(
        requestId: string,
    ): CancelablePromise<ApprovalRequestResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/approvals/{request_id}/cancel',
            path: {
                'request_id': requestId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
