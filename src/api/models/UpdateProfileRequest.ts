/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request schema for updating user profile.
 */
export type UpdateProfileRequest = {
    /**
     * 使用者 UUID
     */
    user_id: string;
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
};

