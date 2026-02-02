/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request schema for resetting password via token.
 */
export type ResetPasswordRequest = {
    /**
     * 密碼重設 token
     */
    token: string;
    /**
     * 新密碼
     */
    new_password: string;
};

