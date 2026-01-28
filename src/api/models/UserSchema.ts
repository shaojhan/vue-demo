/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserRole } from './UserRole';
export type UserSchema = {
    created_at?: string;
    updated_at?: (string | null);
    /**
     * 帳號
     */
    uid: string;
    pwd: string;
    /**
     * 電子郵件
     */
    email: string;
    /**
     * 姓名
     */
    name: string;
    /**
     * 出生日期
     */
    birthdate: string;
    /**
     * 自我介紹
     */
    description: string;
    role: UserRole;
};

