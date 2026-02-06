/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_login_user } from '../models/Body_login_user';
import type { Body_upload_avatar } from '../models/Body_upload_avatar';
import type { CurrentUserResponse } from '../models/CurrentUserResponse';
import type { ForgotPasswordRequest } from '../models/ForgotPasswordRequest';
import type { LoginResponse } from '../models/LoginResponse';
import type { ResendVerificationRequest } from '../models/ResendVerificationRequest';
import type { ResetPasswordRequest } from '../models/ResetPasswordRequest';
import type { UpdatePasswordRequest } from '../models/UpdatePasswordRequest';
import type { UpdateProfileRequest } from '../models/UpdateProfileRequest';
import type { UserListResponse } from '../models/UserListResponse';
import type { UserSchema } from '../models/UserSchema';
import type { UserSearchResponse } from '../models/UserSearchResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserService {
    /**
     * List Users
     * List all users with pagination (Admin only).
     * @param page 頁碼
     * @param size 每頁筆數
     * @returns UserListResponse Successful Response
     * @throws ApiError
     */
    public static listUsers(
        page: number = 1,
        size: number = 20,
    ): CancelablePromise<UserListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/',
            query: {
                'page': page,
                'size': size,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Search Users
     * Search users by keyword (uid, email, or name). For all logged-in users.
     * @param keyword 搜尋關鍵字（帳號、郵件或姓名）
     * @param limit 最大結果數
     * @returns UserSearchResponse Successful Response
     * @throws ApiError
     */
    public static searchUsers(
        keyword: string,
        limit: number = 20,
    ): CancelablePromise<UserSearchResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/search',
            query: {
                'keyword': keyword,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
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
     * Create a new user with profile. A verification email will be sent.
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
     * Verify Email
     * Verify user email with token from verification email.
     * @param token 驗證 token
     * @returns any Successful Response
     * @throws ApiError
     */
    public static verifyEmail(
        token: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/verify-email',
            query: {
                'token': token,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Resend Verification
     * Resend verification email.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static resendVerification(
        requestBody: ResendVerificationRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/resend-verification',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Forgot Password
     * Send a password reset email.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static forgotPassword(
        requestBody: ForgotPasswordRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/forgot-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Reset Password
     * Reset password using a reset token.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static resetPassword(
        requestBody: ResetPasswordRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/reset-password',
            body: requestBody,
            mediaType: 'application/json',
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
    /**
     * Upload Avatar
     * Upload user avatar (multipart/form-data).
     *
     * Supported formats: jpg, jpeg, png, gif, webp
     * Max file size: 5MB
     * @param formData
     * @returns any Successful Response
     * @throws ApiError
     */
    public static uploadAvatar(
        formData: Body_upload_avatar,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/avatar',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
