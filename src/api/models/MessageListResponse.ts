/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MessageListItem } from './MessageListItem';
/**
 * Paginated message list response.
 */
export type MessageListResponse = {
    items: Array<MessageListItem>;
    total: number;
    page: number;
    size: number;
    unread_count?: number;
};

