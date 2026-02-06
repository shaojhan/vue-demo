/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request schema for sending a message.
 */
export type SendMessageRequest = {
    /**
     * Recipient UUID
     */
    recipient_id: string;
    /**
     * Subject
     */
    subject: string;
    /**
     * Content
     */
    content: string;
};

