/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MessageParticipantResponse } from './MessageParticipantResponse';
/**
 * Message list item.
 */
export type MessageListItem = {
    id: number;
    subject: string;
    /**
     * Content preview (first 100 chars)
     */
    content_preview: string;
    sender: MessageParticipantResponse;
    recipient: MessageParticipantResponse;
    is_read: boolean;
    created_at: string;
    reply_count?: number;
};

