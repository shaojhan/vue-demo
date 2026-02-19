/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovalStatus } from './ApprovalStatus';
import type { ApprovalType } from './ApprovalType';
/**
 * Response schema for an approval request in a list.
 */
export type ApprovalListItem = {
    id: string;
    type: ApprovalType;
    status: ApprovalStatus;
    requester_id: string;
    created_at?: (string | null);
    current_step_order?: (number | null);
};

