/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MQTTPublishRequest = {
    /**
     * MQTT topic to publish to
     */
    topic: string;
    /**
     * Message payload
     */
    payload: string;
    /**
     * Quality of Service (0, 1, 2)
     */
    qos?: number;
};

