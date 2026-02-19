/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginRecordItem } from './LoginRecordItem';
/**
 * Paginated login record list response.
 */
export type LoginRecordListResponse = {
    items: Array<LoginRecordItem>;
    total: number;
    page: number;
    size: number;
};

