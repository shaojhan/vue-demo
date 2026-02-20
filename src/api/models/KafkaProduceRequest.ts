/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type KafkaProduceRequest = {
    /**
     * Kafka topic to produce to
     */
    topic: string;
    /**
     * Message value (payload)
     */
    value: string;
    /**
     * Optional message key for partitioning
     */
    key?: (string | null);
};

