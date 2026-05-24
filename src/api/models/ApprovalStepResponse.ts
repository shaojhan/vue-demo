/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovalStatus } from './ApprovalStatus';
/**
 * Response schema for an approval step.
 */
export type ApprovalStepResponse = {
    step_order: number;
    approver_id: string;
    approver_name?: (string | null);
    approver_department?: (string | null);
    approver_role_name?: (string | null);
    approver_role_level?: (number | null);
    status: ApprovalStatus;
    comment?: (string | null);
    decided_at?: (string | null);
    created_at?: (string | null);
};

