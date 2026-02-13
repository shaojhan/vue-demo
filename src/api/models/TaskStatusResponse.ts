/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TaskProgressInfo } from './TaskProgressInfo';
export type TaskStatusResponse = {
    task_id: string;
    /**
     * PENDING | STARTED | PROGRESS | SUCCESS | FAILURE | REVOKED
     */
    status: string;
    /**
     * Progress info (when status is PROGRESS)
     */
    progress?: (TaskProgressInfo | null);
    /**
     * Task result (when status is SUCCESS)
     */
    result?: null;
    /**
     * Error message (when status is FAILURE)
     */
    error?: (string | null);
};

