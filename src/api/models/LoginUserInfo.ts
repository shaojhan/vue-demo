/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserRole } from './UserRole';
/**
 * User information returned after login.
 */
export type LoginUserInfo = {
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
};

