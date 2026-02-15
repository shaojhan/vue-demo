/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MQTTMessageListResponse } from '../models/MQTTMessageListResponse';
import type { MQTTPublishRequest } from '../models/MQTTPublishRequest';
import type { MQTTPublishResponse } from '../models/MQTTPublishResponse';
import type { MQTTStatusResponse } from '../models/MQTTStatusResponse';
import type { MQTTSubscribeRequest } from '../models/MQTTSubscribeRequest';
import type { MQTTSubscriptionResponse } from '../models/MQTTSubscriptionResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MqttService {
    /**
     * Get Status
     * Get MQTT connection status and active subscriptions.
     * @returns MQTTStatusResponse Successful Response
     * @throws ApiError
     */
    public static mqttStatus(): CancelablePromise<MQTTStatusResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/mqtt/status',
        });
    }
    /**
     * Publish Message
     * Publish a message to an MQTT topic.
     * @param requestBody
     * @returns MQTTPublishResponse Successful Response
     * @throws ApiError
     */
    public static mqttPublish(
        requestBody: MQTTPublishRequest,
    ): CancelablePromise<MQTTPublishResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/mqtt/publish',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Subscriptions
     * List active MQTT subscriptions.
     * @returns string Successful Response
     * @throws ApiError
     */
    public static mqttListSubscriptions(): CancelablePromise<Array<string>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/mqtt/subscriptions',
        });
    }
    /**
     * Subscribe Topic
     * Subscribe to an MQTT topic.
     * @param requestBody
     * @returns MQTTSubscriptionResponse Successful Response
     * @throws ApiError
     */
    public static mqttSubscribe(
        requestBody: MQTTSubscribeRequest,
    ): CancelablePromise<MQTTSubscriptionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/mqtt/subscriptions',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Unsubscribe Topic
     * Unsubscribe from an MQTT topic.
     * @param topic
     * @returns MQTTSubscriptionResponse Successful Response
     * @throws ApiError
     */
    public static mqttUnsubscribe(
        topic: string,
    ): CancelablePromise<MQTTSubscriptionResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/mqtt/subscriptions/{topic}',
            path: {
                'topic': topic,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Messages
     * Query stored MQTT messages with optional topic filter and pagination.
     * @param topic Filter by topic
     * @param page
     * @param size
     * @returns MQTTMessageListResponse Successful Response
     * @throws ApiError
     */
    public static mqttListMessages(
        topic?: (string | null),
        page: number = 1,
        size: number = 50,
    ): CancelablePromise<MQTTMessageListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/mqtt/messages',
            query: {
                'topic': topic,
                'page': page,
                'size': size,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
