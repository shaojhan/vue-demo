/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_saml_acs } from '../models/Body_saml_acs';
import type { CreateSSOProviderRequest } from '../models/CreateSSOProviderRequest';
import type { SSOActionResponse } from '../models/SSOActionResponse';
import type { SSOAdminProviderListResponse } from '../models/SSOAdminProviderListResponse';
import type { SSOConfigResponse } from '../models/SSOConfigResponse';
import type { SSOExchangeCodeRequest } from '../models/SSOExchangeCodeRequest';
import type { SSOLoginResponse } from '../models/SSOLoginResponse';
import type { SSOProviderListResponse } from '../models/SSOProviderListResponse';
import type { SSOProviderResponse } from '../models/SSOProviderResponse';
import type { SSOTokenResponse } from '../models/SSOTokenResponse';
import type { UpdateSSOConfigRequest } from '../models/UpdateSSOConfigRequest';
import type { UpdateSSOProviderRequest } from '../models/UpdateSSOProviderRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SsoService {
    /**
     * List Providers
     * List active SSO providers (for login page).
     * @returns SSOProviderListResponse Successful Response
     * @throws ApiError
     */
    public static listSsoProviders(): CancelablePromise<SSOProviderListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/sso/providers',
        });
    }
    /**
     * Sso Login
     * Initiate SSO login. Redirects to IdP.
     * @param slug
     * @returns SSOLoginResponse Successful Response
     * @throws ApiError
     */
    public static ssoLogin(
        slug: string,
    ): CancelablePromise<SSOLoginResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/sso/login/{slug}',
            path: {
                'slug': slug,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Oidc Callback
     * OIDC callback endpoint. Redirects to frontend with a short-lived authorization code.
     * @param slug
     * @param code Authorization code from IdP
     * @param state State for CSRF protection
     * @returns any Successful Response
     * @throws ApiError
     */
    public static oidcCallback(
        slug: string,
        code: string,
        state: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/sso/oidc/{slug}/callback',
            path: {
                'slug': slug,
            },
            query: {
                'code': code,
                'state': state,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Saml Acs
     * SAML ACS endpoint. Redirects to frontend with a short-lived authorization code.
     * @param slug
     * @param formData
     * @returns any Successful Response
     * @throws ApiError
     */
    public static samlAcs(
        slug: string,
        formData: Body_saml_acs,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/sso/saml/{slug}/acs',
            path: {
                'slug': slug,
            },
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Exchange Code
     * Exchange a short-lived authorization code for an access token.
     * @param requestBody
     * @returns SSOTokenResponse Successful Response
     * @throws ApiError
     */
    public static ssoExchangeCode(
        requestBody: SSOExchangeCodeRequest,
    ): CancelablePromise<SSOTokenResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/sso/token',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Saml Metadata
     * Get SP SAML metadata XML.
     * @param slug
     * @returns any Successful Response
     * @throws ApiError
     */
    public static samlMetadata(
        slug: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/sso/saml/{slug}/metadata',
            path: {
                'slug': slug,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Admin List Providers
     * List all SSO providers (admin).
     * @returns SSOAdminProviderListResponse Successful Response
     * @throws ApiError
     */
    public static adminListSsoProviders(): CancelablePromise<SSOAdminProviderListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/sso/admin/providers',
        });
    }
    /**
     * Admin Create Provider
     * Create a new SSO provider.
     * @param requestBody
     * @returns SSOProviderResponse Successful Response
     * @throws ApiError
     */
    public static adminCreateSsoProvider(
        requestBody: CreateSSOProviderRequest,
    ): CancelablePromise<SSOProviderResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/sso/admin/providers',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Admin Get Provider
     * Get an SSO provider detail.
     * @param providerId
     * @returns SSOProviderResponse Successful Response
     * @throws ApiError
     */
    public static adminGetSsoProvider(
        providerId: string,
    ): CancelablePromise<SSOProviderResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/sso/admin/providers/{provider_id}',
            path: {
                'provider_id': providerId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Admin Update Provider
     * Update an SSO provider.
     * @param providerId
     * @param requestBody
     * @returns SSOProviderResponse Successful Response
     * @throws ApiError
     */
    public static adminUpdateSsoProvider(
        providerId: string,
        requestBody: UpdateSSOProviderRequest,
    ): CancelablePromise<SSOProviderResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/sso/admin/providers/{provider_id}',
            path: {
                'provider_id': providerId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Admin Delete Provider
     * Delete an SSO provider.
     * @param providerId
     * @returns SSOActionResponse Successful Response
     * @throws ApiError
     */
    public static adminDeleteSsoProvider(
        providerId: string,
    ): CancelablePromise<SSOActionResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/sso/admin/providers/{provider_id}',
            path: {
                'provider_id': providerId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Admin Activate Provider
     * Activate an SSO provider.
     * @param providerId
     * @returns SSOProviderResponse Successful Response
     * @throws ApiError
     */
    public static adminActivateSsoProvider(
        providerId: string,
    ): CancelablePromise<SSOProviderResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/sso/admin/providers/{provider_id}/activate',
            path: {
                'provider_id': providerId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Admin Deactivate Provider
     * Deactivate an SSO provider.
     * @param providerId
     * @returns SSOProviderResponse Successful Response
     * @throws ApiError
     */
    public static adminDeactivateSsoProvider(
        providerId: string,
    ): CancelablePromise<SSOProviderResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/sso/admin/providers/{provider_id}/deactivate',
            path: {
                'provider_id': providerId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Admin Get Config
     * Get global SSO configuration.
     * @returns SSOConfigResponse Successful Response
     * @throws ApiError
     */
    public static adminGetSsoConfig(): CancelablePromise<SSOConfigResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/sso/admin/config',
        });
    }
    /**
     * Admin Update Config
     * Update global SSO configuration.
     * @param requestBody
     * @returns SSOConfigResponse Successful Response
     * @throws ApiError
     */
    public static adminUpdateSsoConfig(
        requestBody: UpdateSSOConfigRequest,
    ): CancelablePromise<SSOConfigResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/sso/admin/config',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
