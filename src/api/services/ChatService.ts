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
export class ChatService {
    /**
     * Send Message
     * Send a message to the AI schedule assistant.
     * @param requestBody
     * @returns ChatResponse Successful Response
     * @throws ApiError
     */
    public static sendMessageChatPost(
        requestBody: ChatRequest,
    ): CancelablePromise<ChatResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/chat/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Conversations
     * List user's conversations.
     * @param page Page number
     * @param size Page size
     * @returns ConversationListResponse Successful Response
     * @throws ApiError
     */
    public static listConversationsChatConversationsGet(
        page: number = 1,
        size: number = 20,
    ): CancelablePromise<ConversationListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/chat/conversations',
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
     * Get conversation detail with messages.
     * @param conversationId
     * @returns ConversationDetailResponse Successful Response
     * @throws ApiError
     */
    public static getConversationChatConversationsConversationIdGet(
        conversationId: string,
    ): CancelablePromise<ConversationDetailResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/chat/conversations/{conversation_id}',
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
     * Delete a conversation.
     * @param conversationId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteConversationChatConversationsConversationIdDelete(
        conversationId: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/chat/conversations/{conversation_id}',
            path: {
                'conversation_id': conversationId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
