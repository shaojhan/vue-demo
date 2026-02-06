/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Per-row result of CSV upload.
 */
export type CsvUploadResultItem = {
    /**
     * CSV 行號
     */
    row: number;
    /**
     * 員工編號
     */
    idno: string;
    /**
     * 是否成功
     */
    success: boolean;
    /**
     * 結果訊息
     */
    message: string;
};

