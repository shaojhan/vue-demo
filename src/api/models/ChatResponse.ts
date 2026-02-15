/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActionTakenItem } from './ActionTakenItem';
/**
 * Response from the AI chat.
 */
export type ChatResponse = {
    conversation_id: string;
    message: string;
    actions_taken?: Array<ActionTakenItem>;
};

