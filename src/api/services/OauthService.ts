/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginResponse } from '../models/LoginResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OauthService {
    /**
     * Google Login
     * Redirect to Google OAuth2 consent screen.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static googleLogin(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/google/login',
        });
    }
    /**
     * Google Callback
     * Handle Google OAuth2 callback. Exchanges code for token and creates/logs in user.
     * @param code Authorization code from Google
     * @returns LoginResponse Successful Response
     * @throws ApiError
     */
    public static googleCallback(
        code: string,
    ): CancelablePromise<LoginResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/google/callback',
            query: {
                'code': code,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
