/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TaskCancelResponse } from '../models/TaskCancelResponse';
import type { TaskStatusResponse } from '../models/TaskStatusResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TaskService {
    /**
     * Get Task Status
     * Get the current status and progress of a background task.
     * @param taskId
     * @returns TaskStatusResponse Successful Response
     * @throws ApiError
     */
    public static getTaskStatus(
        taskId: string,
    ): CancelablePromise<TaskStatusResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/tasks/status/{task_id}',
            path: {
                'task_id': taskId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Cancel Task
     * Cancel a running or pending task.
     * @param taskId
     * @returns TaskCancelResponse Successful Response
     * @throws ApiError
     */
    public static cancelTask(
        taskId: string,
    ): CancelablePromise<TaskCancelResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/tasks/cancel/{task_id}',
            path: {
                'task_id': taskId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Enqueue Add
     * Demo endpoint: enqueue a long-running test task.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static enqueueDemoAdd(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/tasks/add',
        });
    }
}
