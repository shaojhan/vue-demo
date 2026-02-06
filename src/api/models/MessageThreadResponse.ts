/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MessageResponse } from './MessageResponse';
/**
 * Message thread response.
 */
export type MessageThreadResponse = {
    original_message: MessageResponse;
    replies: Array<MessageResponse>;
    total_messages: number;
};

