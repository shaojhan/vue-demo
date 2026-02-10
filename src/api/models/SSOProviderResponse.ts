/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AttributeMappingResponse } from './AttributeMappingResponse';
import type { OIDCConfigResponse } from './OIDCConfigResponse';
import type { SAMLConfigResponse } from './SAMLConfigResponse';
/**
 * Full SSO provider response.
 */
export type SSOProviderResponse = {
    id: string;
    name: string;
    slug: string;
    protocol: string;
    saml_config?: (SAMLConfigResponse | null);
    oidc_config?: (OIDCConfigResponse | null);
    attribute_mapping: AttributeMappingResponse;
    is_active: boolean;
    display_order: number;
    created_at?: (string | null);
    updated_at?: (string | null);
};

