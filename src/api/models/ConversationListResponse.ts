/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ConversationListItem } from './ConversationListItem';
/**
 * Paginated conversation list response.
 */
export type ConversationListResponse = {
    items: Array<ConversationListItem>;
    total: number;
    page: number;
    size: number;
};

