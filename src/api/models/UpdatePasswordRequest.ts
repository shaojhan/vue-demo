/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request schema for updating user password.
 */
export type UpdatePasswordRequest = {
    /**
     * 使用者 UUID
     */
    user_id: string;
    /**
     * 舊密碼
     */
    old_password: string;
    /**
     * 新密碼
     */
    new_password: string;
};

