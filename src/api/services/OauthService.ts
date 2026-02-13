/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OAuthExchangeCodeRequest } from '../models/OAuthExchangeCodeRequest';
import type { OAuthTokenResponse } from '../models/OAuthTokenResponse';
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
     * Handle Google OAuth2 callback. Redirects to frontend with a short-lived authorization code.
     * @param code Authorization code from Google
     * @returns any Successful Response
     * @throws ApiError
     */
    public static googleCallback(
        code: string,
    ): CancelablePromise<any> {
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
    /**
     * Exchange Code
     * Exchange a short-lived authorization code for an access token.
     * @param requestBody
     * @returns OAuthTokenResponse Successful Response
     * @throws ApiError
     */
    public static googleExchangeCode(
        requestBody: OAuthExchangeCodeRequest,
    ): CancelablePromise<OAuthTokenResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/google/token',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
