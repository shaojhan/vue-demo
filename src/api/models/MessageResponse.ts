/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MessageParticipantResponse } from './MessageParticipantResponse';
/**
 * Single message response.
 */
export type MessageResponse = {
    id: number;
    subject: string;
    content: string;
    sender: MessageParticipantResponse;
    recipient: MessageParticipantResponse;
    parent_id?: (number | null);
    is_read: boolean;
    read_at?: (string | null);
    created_at: string;
    reply_count?: number;
};

