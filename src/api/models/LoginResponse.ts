/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginUserInfo } from './LoginUserInfo';
/**
 * Response schema for successful login.
 */
export type LoginResponse = {
    /**
     * JWT access token
     */
    access_token: string;
    /**
     * Token type
     */
    token_type?: string;
    /**
     * Token expiration time in seconds
     */
    expires_in: number;
    /**
     * User information
     */
    user: LoginUserInfo;
};

