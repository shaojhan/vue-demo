/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EmployeeListItem } from './EmployeeListItem';
/**
 * Paginated employee list response.
 */
export type EmployeeListResponse = {
    items: Array<EmployeeListItem>;
    total: number;
    page: number;
    size: number;
};

