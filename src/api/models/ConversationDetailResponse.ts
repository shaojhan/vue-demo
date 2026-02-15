/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MessageItem } from './MessageItem';
/**
 * Conversation detail with messages.
 */
export type ConversationDetailResponse = {
    id: string;
    title?: (string | null);
    messages: Array<MessageItem>;
};

