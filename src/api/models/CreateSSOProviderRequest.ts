/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AttributeMappingRequest } from './AttributeMappingRequest';
import type { OIDCConfigRequest } from './OIDCConfigRequest';
import type { SAMLConfigRequest } from './SAMLConfigRequest';
/**
 * Request to create an SSO provider.
 */
export type CreateSSOProviderRequest = {
    /**
     * Provider display name
     */
    name: string;
    /**
     * URL-friendly identifier
     */
    slug: string;
    /**
     * Protocol: SAML or OIDC
     */
    protocol: string;
    /**
     * SAML configuration
     */
    saml_config?: (SAMLConfigRequest | null);
    /**
     * OIDC configuration
     */
    oidc_config?: (OIDCConfigRequest | null);
    /**
     * Attribute mapping
     */
    attribute_mapping?: (AttributeMappingRequest | null);
    /**
     * Display order on login page
     */
    display_order?: number;
};

