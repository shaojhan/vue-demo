/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CsvUploadResultItem } from './CsvUploadResultItem';
/**
 * Response schema for CSV batch upload.
 */
export type CsvUploadResponse = {
    /**
     * 總處理筆數
     */
    total: number;
    /**
     * 成功筆數
     */
    success_count: number;
    /**
     * 失敗筆數
     */
    failure_count: number;
    /**
     * 每筆處理結果
     */
    results: Array<CsvUploadResultItem>;
};

