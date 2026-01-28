/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_login_user } from '../models/Body_login_user';
import type { CurrentUserResponse } from '../models/CurrentUserResponse';
import type { LoginResponse } from '../models/LoginResponse';
import type { UpdatePasswordRequest } from '../models/UpdatePasswordRequest';
import type { UpdateProfileRequest } from '../models/UpdateProfileRequest';
import type { UserSchema } from '../models/UserSchema';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserService {
    /**
     * Get Me
     * Get the currently authenticated user's information.
     * @returns CurrentUserResponse Successful Response
     * @throws ApiError
     */
    public static getCurrentUser(): CancelablePromise<CurrentUserResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/me',
        });
    }
    /**
     * Create User
     * Create a new user with profile.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static createUser(
        requestBody: UserSchema,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/create',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Login User
     * Authenticate user and return JWT token.
     * Accepts uid or email as username, plus password.
     * @param formData
     * @returns LoginResponse Successful Response
     * @throws ApiError
     */
    public static loginUser(
        formData: Body_login_user,
    ): CancelablePromise<LoginResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/login',
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Password
     * Update user password.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updatePassword(
        requestBody: UpdatePasswordRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/update',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update User Profile
     * Update user profile.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updateUserProfile(
        requestBody: UpdateProfileRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/profile/update',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
