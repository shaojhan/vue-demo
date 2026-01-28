/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CurrentUserProfileResponse } from './CurrentUserProfileResponse';
import type { UserRole } from './UserRole';
/**
 * Response schema for GET /users/me.
 */
export type CurrentUserResponse = {
    /**
     * uuid
     */
    id: string;
    /**
     * 帳號
     */
    uid: string;
    /**
     * 電子郵件
     */
    email: string;
    /**
     * 角色
     */
    role: UserRole;
    /**
     * 個人資料
     */
    profile: CurrentUserProfileResponse;
};

