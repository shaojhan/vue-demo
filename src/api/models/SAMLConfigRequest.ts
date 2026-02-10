/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * SAML IdP configuration.
 */
export type SAMLConfigRequest = {
    /**
     * IdP Entity ID
     */
    idp_entity_id: string;
    /**
     * IdP SSO URL
     */
    idp_sso_url: string;
    /**
     * IdP X.509 Certificate
     */
    idp_x509_cert: string;
    /**
     * SP Entity ID
     */
    sp_entity_id: string;
    /**
     * SP ACS URL
     */
    sp_acs_url: string;
    /**
     * IdP SLO URL
     */
    idp_slo_url?: (string | null);
};

