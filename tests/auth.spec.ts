import { test, expect } from '@playwright/test';
import {
  ADMIN_USER,
  mockLoginFailure,
  mockLoginSuccess,
  seedAuth,
  stubRemainingApi,
} from './helpers';

const EMAIL_PLACEHOLDER = 'name@example.com';
const PASSWORD_PLACEHOLDER = '輸入您的密碼';

test.describe('登入 / Login', () => {
  test('顯示登入表單', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: '歡迎回來' })).toBeVisible();
    await expect(page.getByPlaceholder(EMAIL_PLACEHOLDER)).toBeVisible();
    await expect(page.getByPlaceholder(PASSWORD_PLACEHOLDER)).toBeVisible();
    await expect(page.getByRole('button', { name: '登入', exact: true })).toBeVisible();
  });

  test('空欄位送出時顯示驗證錯誤且不離開頁面', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: '登入', exact: true }).click();

    await expect(page.getByText('請輸入用戶名和密碼')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('帳密正確時登入並導向儀表板', async ({ page }) => {
    await stubRemainingApi(page);
    await mockLoginSuccess(page, ADMIN_USER);

    await page.goto('/login');
    await page.getByPlaceholder(EMAIL_PLACEHOLDER).fill('admin@example.com');
    await page.getByPlaceholder(PASSWORD_PLACEHOLDER).fill('secret');
    // 確認值已綁定（避免 hydration 尚未完成就送出造成原生表單刷新）
    await expect(page.getByPlaceholder(EMAIL_PLACEHOLDER)).toHaveValue('admin@example.com');

    const loginResp = page.waitForResponse('**/api/users/login');
    await page.getByRole('button', { name: '登入', exact: true }).click();
    await loginResp;

    await expect(page).toHaveURL(/\/dashboard/);
    // 登入成功後進入 AppShell 版面
    await expect(page.locator('.app-shell')).toBeVisible();
  });

  test('帳密錯誤時顯示錯誤訊息且停留在登入頁', async ({ page }) => {
    await mockLoginFailure(page, 401);

    await page.goto('/login');
    await page.getByPlaceholder(EMAIL_PLACEHOLDER).fill('admin@example.com');
    await page.getByPlaceholder(PASSWORD_PLACEHOLDER).fill('wrong');
    await expect(page.getByPlaceholder(PASSWORD_PLACEHOLDER)).toHaveValue('wrong');

    const loginResp = page.waitForResponse('**/api/users/login');
    await page.getByRole('button', { name: '登入', exact: true }).click();
    await loginResp;

    await expect(page.getByText('帳號或密碼錯誤，請重新輸入')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('session 過期時顯示提示', async ({ page }) => {
    await page.goto('/login?expired=1');
    await expect(page.getByText('您的登入已過期，請重新登入')).toBeVisible();
  });

  test('提供前往註冊與忘記密碼的連結', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('link', { name: '忘記密碼？' })).toBeVisible();

    await page.getByRole('link', { name: '免費註冊' }).click();
    await expect(page).toHaveURL(/\/register/);
  });
});

test.describe('登出 / Logout', () => {
  test('登出後導向登入頁，且受保護路由需重新登入', async ({ page }) => {
    await seedAuth(page, ADMIN_USER);
    await stubRemainingApi(page);

    await page.goto('/dashboard');
    await expect(page.locator('.app-shell')).toBeVisible();

    // 開啟使用者選單並登出
    await page.locator('.user-trigger').click();
    await page.getByText('登出', { exact: true }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
