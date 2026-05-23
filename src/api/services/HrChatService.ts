/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChatRequest } from '../models/ChatRequest';
import type { ChatResponse } from '../models/ChatResponse';
import type { ConversationDetailResponse } from '../models/ConversationDetailResponse';
import type { ConversationListResponse } from '../models/ConversationListResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class HrChatService {
    /**
     * Send Message
     * Send a message to the HR approval assistant.
     * @param requestBody
     * @returns ChatResponse Successful Response
     * @throws ApiError
     */
    public static sendMessageHrChatPost(
        requestBody: ChatRequest,
    ): CancelablePromise<ChatResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/hr-chat/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Conversations
     * List HR chat conversations.
     * @param page Page number
     * @param size Page size
     * @returns ConversationListResponse Successful Response
     * @throws ApiError
     */
    public static listConversationsHrChatConversationsGet(
        page: number = 1,
        size: number = 20,
    ): CancelablePromise<ConversationListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/hr-chat/conversations',
            query: {
                'page': page,
                'size': size,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Conversation
     * Get HR conversation detail with messages.
     * @param conversationId
     * @returns ConversationDetailResponse Successful Response
     * @throws ApiError
     */
    public static getConversationHrChatConversationsConversationIdGet(
        conversationId: string,
    ): CancelablePromise<ConversationDetailResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/hr-chat/conversations/{conversation_id}',
            path: {
                'conversation_id': conversationId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Conversation
     * Delete an HR chat conversation.
     * @param conversationId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteConversationHrChatConversationsConversationIdDelete(
        conversationId: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/hr-chat/conversations/{conversation_id}',
            path: {
                'conversation_id': conversationId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
