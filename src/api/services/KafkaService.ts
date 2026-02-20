/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { KafkaMessageListResponse } from '../models/KafkaMessageListResponse';
import type { KafkaProduceRequest } from '../models/KafkaProduceRequest';
import type { KafkaProduceResponse } from '../models/KafkaProduceResponse';
import type { KafkaStatusResponse } from '../models/KafkaStatusResponse';
import type { KafkaSubscribeRequest } from '../models/KafkaSubscribeRequest';
import type { KafkaSubscriptionResponse } from '../models/KafkaSubscriptionResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class KafkaService {
    /**
     * Get Status
     * Get Kafka connection status and active subscriptions.
     * @returns KafkaStatusResponse Successful Response
     * @throws ApiError
     */
    public static kafkaStatus(): CancelablePromise<KafkaStatusResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/kafka/status',
        });
    }
    /**
     * Produce Message
     * Produce a message to a Kafka topic.
     * @param requestBody
     * @returns KafkaProduceResponse Successful Response
     * @throws ApiError
     */
    public static kafkaProduce(
        requestBody: KafkaProduceRequest,
    ): CancelablePromise<KafkaProduceResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/kafka/produce',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Subscriptions
     * List active Kafka subscriptions.
     * @returns string Successful Response
     * @throws ApiError
     */
    public static kafkaListSubscriptions(): CancelablePromise<Array<string>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/kafka/subscriptions',
        });
    }
    /**
     * Subscribe Topic
     * Subscribe to a Kafka topic.
     * @param requestBody
     * @returns KafkaSubscriptionResponse Successful Response
     * @throws ApiError
     */
    public static kafkaSubscribe(
        requestBody: KafkaSubscribeRequest,
    ): CancelablePromise<KafkaSubscriptionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/kafka/subscriptions',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Unsubscribe Topic
     * Unsubscribe from a Kafka topic.
     * @param topic
     * @returns KafkaSubscriptionResponse Successful Response
     * @throws ApiError
     */
    public static kafkaUnsubscribe(
        topic: string,
    ): CancelablePromise<KafkaSubscriptionResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/kafka/subscriptions/{topic}',
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
     * Query stored Kafka messages with optional topic filter and pagination.
     * @param topic Filter by topic
     * @param page
     * @param size
     * @returns KafkaMessageListResponse Successful Response
     * @throws ApiError
     */
    public static kafkaListMessages(
        topic?: (string | null),
        page: number = 1,
        size: number = 50,
    ): CancelablePromise<KafkaMessageListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/kafka/messages',
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
