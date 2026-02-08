/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ScheduleListItem } from './ScheduleListItem';
/**
 * Paginated schedule list response.
 */
export type ScheduleListResponse = {
    items: Array<ScheduleListItem>;
    total: number;
    page: number;
    size: number;
};

