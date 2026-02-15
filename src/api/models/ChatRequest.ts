/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request schema for sending a chat message.
 */
export type ChatRequest = {
    /**
     * User message
     */
    message: string;
    /**
     * Existing conversation ID, null to create new
     */
    conversation_id?: (string | null);
};

