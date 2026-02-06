/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BatchMarkReadRequest } from '../models/BatchMarkReadRequest';
import type { MessageActionResponse } from '../models/MessageActionResponse';
import type { MessageListResponse } from '../models/MessageListResponse';
import type { MessageResponse } from '../models/MessageResponse';
import type { MessageThreadResponse } from '../models/MessageThreadResponse';
import type { ReplyMessageRequest } from '../models/ReplyMessageRequest';
import type { SendMessageRequest } from '../models/SendMessageRequest';
import type { UnreadCountResponse } from '../models/UnreadCountResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MessageService {
    /**
     * Send Message
     * Send a new message.
     * @param requestBody
     * @returns MessageResponse Successful Response
     * @throws ApiError
     */
    public static sendMessage(
        requestBody: SendMessageRequest,
    ): CancelablePromise<MessageResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/messages/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Reply Message
     * Reply to a message.
     * @param messageId
     * @param requestBody
     * @returns MessageResponse Successful Response
     * @throws ApiError
     */
    public static replyMessage(
        messageId: number,
        requestBody: ReplyMessageRequest,
    ): CancelablePromise<MessageResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/messages/{message_id}/reply',
            path: {
                'message_id': messageId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Inbox
     * Get inbox messages.
     * @param page Page number
     * @param size Page size
     * @returns MessageListResponse Successful Response
     * @throws ApiError
     */
    public static getInbox(
        page: number = 1,
        size: number = 20,
    ): CancelablePromise<MessageListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/messages/inbox',
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
     * Get Sent
     * Get sent messages.
     * @param page Page number
     * @param size Page size
     * @returns MessageListResponse Successful Response
     * @throws ApiError
     */
    public static getSent(
        page: number = 1,
        size: number = 20,
    ): CancelablePromise<MessageListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/messages/sent',
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
     * Get Unread Count
     * Get unread message count.
     * @returns UnreadCountResponse Successful Response
     * @throws ApiError
     */
    public static getUnreadCount(): CancelablePromise<UnreadCountResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/messages/unread-count',
        });
    }
    /**
     * Get Thread
     * Get message thread with all replies.
     * @param messageId
     * @returns MessageThreadResponse Successful Response
     * @throws ApiError
     */
    public static getThread(
        messageId: number,
    ): CancelablePromise<MessageThreadResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/messages/thread/{message_id}',
            path: {
                'message_id': messageId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Message
     * Get a single message detail.
     * @param messageId
     * @returns MessageResponse Successful Response
     * @throws ApiError
     */
    public static getMessage(
        messageId: number,
    ): CancelablePromise<MessageResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/messages/{message_id}',
            path: {
                'message_id': messageId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Message
     * Delete a message (soft delete).
     * @param messageId
     * @returns MessageActionResponse Successful Response
     * @throws ApiError
     */
    public static deleteMessage(
        messageId: number,
    ): CancelablePromise<MessageActionResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/messages/{message_id}',
            path: {
                'message_id': messageId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Mark As Read
     * Mark a message as read.
     * @param messageId
     * @returns MessageActionResponse Successful Response
     * @throws ApiError
     */
    public static markAsRead(
        messageId: number,
    ): CancelablePromise<MessageActionResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/messages/{message_id}/read',
            path: {
                'message_id': messageId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Batch Mark As Read
     * Batch mark messages as read.
     * @param requestBody
     * @returns MessageActionResponse Successful Response
     * @throws ApiError
     */
    public static batchMarkAsRead(
        requestBody: BatchMarkReadRequest,
    ): CancelablePromise<MessageActionResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/messages/batch-read',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
