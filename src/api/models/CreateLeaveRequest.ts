/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LeaveType } from './LeaveType';
/**
 * Request schema for creating a leave approval request.
 */
export type CreateLeaveRequest = {
    /**
     * Type of leave
     */
    leave_type: LeaveType;
    /**
     * Leave start date/time
     */
    start_date: string;
    /**
     * Leave end date/time
     */
    end_date: string;
    /**
     * Reason for leave
     */
    reason: string;
};

