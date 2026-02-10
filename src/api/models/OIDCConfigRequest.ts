/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * OIDC configuration.
 */
export type OIDCConfigRequest = {
    /**
     * OIDC Client ID
     */
    client_id: string;
    /**
     * OIDC Client Secret
     */
    client_secret: string;
    /**
     * Authorization URL
     */
    authorization_url: string;
    /**
     * Token URL
     */
    token_url: string;
    /**
     * UserInfo URL
     */
    userinfo_url?: (string | null);
    /**
     * JWKS URI
     */
    jwks_uri?: (string | null);
    /**
     * Scopes
     */
    scopes?: string;
};

