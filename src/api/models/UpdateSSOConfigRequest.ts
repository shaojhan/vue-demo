/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request to update global SSO configuration.
 */
export type UpdateSSOConfigRequest = {
    /**
     * Auto-create users on SSO login
     */
    auto_create_users?: (boolean | null);
    /**
     * Enforce SSO (disable password login)
     */
    enforce_sso?: (boolean | null);
    /**
     * Default role for auto-created users
     */
    default_role?: (string | null);
};

