/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request schema for creating an expense approval request.
 */
export type CreateExpenseRequest = {
    /**
     * Expense amount
     */
    amount: number;
    /**
     * Expense category
     */
    category: string;
    /**
     * Expense description
     */
    description: string;
    /**
     * Receipt URL
     */
    receipt_url?: (string | null);
};

