/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AttributeMappingRequest } from './AttributeMappingRequest';
import type { OIDCConfigRequest } from './OIDCConfigRequest';
import type { SAMLConfigRequest } from './SAMLConfigRequest';
/**
 * Request to update an SSO provider.
 */
export type UpdateSSOProviderRequest = {
    /**
     * Provider display name
     */
    name?: (string | null);
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
     * Display order
     */
    display_order?: (number | null);
};

