/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserListItem } from './UserListItem';
/**
 * Paginated user list response.
 */
export type UserListResponse = {
    items: Array<UserListItem>;
    total: number;
    page: number;
    size: number;
};

