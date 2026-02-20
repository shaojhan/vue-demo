/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type KafkaMessageItem = {
    id: number;
    topic: string;
    key: (string | null);
    value: string;
    partition: (number | null);
    offset: (number | null);
    received_at: string;
};

