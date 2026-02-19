/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovalStatus } from './ApprovalStatus';
import type { ApprovalStepResponse } from './ApprovalStepResponse';
import type { ApprovalType } from './ApprovalType';
/**
 * Response schema for a full approval request with steps.
 */
export type ApprovalRequestResponse = {
    id: string;
    type: ApprovalType;
    status: ApprovalStatus;
    requester_id: string;
    detail: Record<string, any>;
    steps: Array<ApprovalStepResponse>;
    current_step_order?: (number | null);
    created_at?: (string | null);
    updated_at?: (string | null);
};

