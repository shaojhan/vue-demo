import type { Page, Route } from '@playwright/test';

/**
 * Shared fixtures/utilities for the e2e suite.
 *
 * The app talks to a backend under `/api/**` (OpenAPI.BASE = '/api', proxied to
 * localhost in dev). To keep the tests hermetic and runnable in CI without a
 * real backend, every spec mocks the relevant API routes via `page.route`.
 *
 * Route precedence note: Playwright runs the most-recently-registered matching
 * handler first. The broad `stubRemainingApi` catch-all must therefore be
 * registered BEFORE any specific route mock, so the specific mock wins.
 */

export interface MockUser {
  id: string;
  uid: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'NORMAL';
}

export const ADMIN_USER: MockUser = {
  id: 'u-admin',
  uid: 'admin',
  email: 'admin@example.com',
  role: 'ADMIN',
};

export const NORMAL_USER: MockUser = {
  id: 'u-normal',
  uid: 'alice',
  email: 'alice@example.com',
  role: 'NORMAL',
};

/**
 * Build the JSON payload pinia-plugin-persistedstate restores from localStorage.
 * The `auth` store persists { user, accessToken, expiresAt }; `isLoggedIn`
 * requires a future `expiresAt`.
 */
function persistedAuth(user: MockUser, token = 'test-token') {
  return JSON.stringify({
    user,
    accessToken: token,
    expiresAt: Date.now() + 60 * 60 * 1000, // +1h
  });
}

/**
 * Seed an authenticated session before the SPA boots, so guarded routes load
 * directly without going through the login form.
 */
export async function seedAuth(page: Page, user: MockUser = ADMIN_USER, token = 'test-token') {
  await page.addInitScript(
    ([key, value]) => {
      window.localStorage.setItem(key, value);
    },
    ['auth', persistedAuth(user, token)] as const,
  );
}

/** Mock a successful POST /api/users/login that returns a LoginResponse. */
export async function mockLoginSuccess(page: Page, user: MockUser = ADMIN_USER) {
  await page.route('**/api/users/login', (route: Route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'test-token',
        token_type: 'bearer',
        expires_in: 3600,
        user,
      }),
    }),
  );
}

/** Mock a failing POST /api/users/login (default: 401 bad credentials). */
export async function mockLoginFailure(page: Page, status = 401) {
  await page.route('**/api/users/login', (route: Route) =>
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'invalid credentials' }),
    }),
  );
}

/** Mock POST /api/users/create (registration). */
export async function mockRegister(page: Page, status = 200) {
  await page.route('**/api/users/create', (route: Route) =>
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ ok: status === 200 }),
    }),
  );
}

/**
 * Catch-all so unmocked API calls made by guarded pages (dashboards, lists, …)
 * don't hit a real server or hang the test. Register this FIRST, before any
 * specific mock (see precedence note above).
 *
 * NOTE: the pattern is anchored to `<origin>/api/` on purpose — a loose
 * `**​/api/**` glob also matches Vite's dev-server source modules under
 * `/src/api/...` (the generated API client), which would be served as JSON and
 * break the whole SPA boot. Only real backend calls (OpenAPI.BASE = '/api')
 * must be intercepted.
 */
const BACKEND_API = /^https?:\/\/[^/]+\/api\//;

export async function stubRemainingApi(page: Page) {
  await page.route(BACKEND_API, (route: Route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [], data: [], total: 0 }),
      });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
}
