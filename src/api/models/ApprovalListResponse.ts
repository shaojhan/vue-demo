/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovalListItem } from './ApprovalListItem';
/**
 * Paginated list of approval requests.
 */
export type ApprovalListResponse = {
    items: Array<ApprovalListItem>;
    total: number;
    page: number;
    size: number;
};

