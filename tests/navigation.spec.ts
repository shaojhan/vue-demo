import { test, expect } from '@playwright/test';
import { ADMIN_USER, NORMAL_USER, seedAuth, stubRemainingApi } from './helpers';

test.describe('公開頁面 / Public pages', () => {
  test('首頁可公開存取', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '歡迎使用 MES 平台' })).toBeVisible();
  });

  test('未知路徑顯示 404 頁面，返回首頁可回到首頁', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByText('404')).toBeVisible();

    await page.getByRole('button', { name: '返回首頁' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: '歡迎使用 MES 平台' })).toBeVisible();
  });
});

test.describe('路由守衛 / Route guards', () => {
  test('未登入存取受保護頁面時導向登入頁', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('一般使用者不能進入需要管理員的頁面，會被導回首頁', async ({ page }) => {
    await seedAuth(page, NORMAL_USER);
    await stubRemainingApi(page);

    await page.goto('/admin');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: '歡迎使用 MES 平台' })).toBeVisible();
  });

  test('一般使用者不能進入需要員工權限的頁面，會被導向個人資訊', async ({ page }) => {
    await seedAuth(page, NORMAL_USER);
    await stubRemainingApi(page);

    await page.goto('/approvals');
    await expect(page).toHaveURL(/\/user/);
  });

  test('已登入的管理員可以進入受保護的管理後台', async ({ page }) => {
    await seedAuth(page, ADMIN_USER);
    await stubRemainingApi(page);

    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator('.app-shell')).toBeVisible();
  });

  test('已過期的 session 存取受保護路由會被導回登入頁', async ({ page }) => {
    await stubRemainingApi(page);
    // 種入一個已過期的 session（expiresAt 在過去）
    await page.addInitScript((value) => {
      window.localStorage.setItem('auth', value);
    }, JSON.stringify({ user: ADMIN_USER, accessToken: 'expired', expiresAt: Date.now() - 1000 }));

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('側邊欄導覽 / Sidebar navigation', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page, ADMIN_USER);
    await stubRemainingApi(page);
  });

  test('登入後顯示應用外殼', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('.app-shell')).toBeVisible();
  });

  const navTargets: Array<{ label: string; url: RegExp }> = [
    { label: '簽核管理', url: /\/approvals/ },
    { label: '排程管理', url: /\/schedules/ },
    { label: '訊息中心', url: /\/messages/ },
    { label: 'Kafka', url: /\/kafka/ },
    { label: 'MQTT', url: /\/mqtt/ },
    { label: '管理後台', url: /\/admin/ },
    { label: '登入紀錄', url: /\/login-records/ },
  ];

  for (const { label, url } of navTargets) {
    test(`可從側邊欄導覽至「${label}」`, async ({ page }) => {
      await page.goto('/dashboard');
      // 側邊欄主選單（排除行動版抽屜中的重複選單）
      await page
        .locator('.n-layout-sider')
        .locator('.n-menu-item-content', { hasText: label })
        .first()
        .click();
      await expect(page).toHaveURL(url);
    });
  }
});
