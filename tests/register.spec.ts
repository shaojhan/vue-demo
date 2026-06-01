import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { mockRegister } from './helpers';

async function fillRequiredFields(page: Page, password = 'secret123') {
  await page.getByPlaceholder('請輸入帳號').fill('newuser');
  await page.getByPlaceholder('請輸入姓名').fill('新使用者');
  await page.getByPlaceholder('name@example.com').fill('new@example.com');
  await page.getByPlaceholder('至少 6 位').fill(password);
  await page.getByPlaceholder('再次輸入密碼').fill(password);

  await pickAnyDate(page);
}

/** Open the NDatePicker panel and commit a selectable (non-excluded) date. */
async function pickAnyDate(page: Page) {
  await page.locator('.n-date-picker').click();
  await page
    .locator('.n-date-panel-date:not(.n-date-panel-date--excluded)')
    .first()
    .click();
  // 面板關閉後再繼續，避免覆蓋後續點擊
  await expect(page.locator('.n-date-panel')).toBeHidden();
}

test.describe('註冊 / Register', () => {
  test('顯示註冊表單', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByPlaceholder('請輸入帳號')).toBeVisible();
    await expect(page.getByPlaceholder('請輸入姓名')).toBeVisible();
    await expect(page.getByPlaceholder('name@example.com')).toBeVisible();
    await expect(page.getByRole('button', { name: '建立帳戶' })).toBeVisible();
  });

  test('必填欄位未填時顯示驗證錯誤', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('button', { name: '建立帳戶' }).click();

    await expect(page.getByText('請填寫所有必填欄位')).toBeVisible();
    await expect(page).toHaveURL(/\/register/);
  });

  test('兩次密碼不一致時顯示錯誤', async ({ page }) => {
    await page.goto('/register');
    await page.getByPlaceholder('請輸入帳號').fill('newuser');
    await page.getByPlaceholder('請輸入姓名').fill('新使用者');
    await page.getByPlaceholder('name@example.com').fill('new@example.com');
    await page.getByPlaceholder('至少 6 位').fill('secret123');
    await page.getByPlaceholder('再次輸入密碼').fill('different');
    await pickAnyDate(page);

    await page.getByRole('button', { name: '建立帳戶' }).click();
    await expect(page.getByText('兩次輸入的密碼不一致')).toBeVisible();
    await expect(page).toHaveURL(/\/register/);
  });

  test('註冊成功後導向登入頁', async ({ page }) => {
    await mockRegister(page, 200);
    page.on('dialog', (dialog) => dialog.accept()); // 自動關閉「註冊成功！」alert

    await page.goto('/register');
    await fillRequiredFields(page);

    const createResp = page.waitForResponse('**/api/users/create');
    await page.getByRole('button', { name: '建立帳戶' }).click();
    await createResp;

    await expect(page).toHaveURL(/\/login/);
  });

  test('帳號已存在時顯示錯誤並停留在註冊頁', async ({ page }) => {
    await mockRegister(page, 409);

    await page.goto('/register');
    await fillRequiredFields(page);

    const createResp = page.waitForResponse('**/api/users/create');
    await page.getByRole('button', { name: '建立帳戶' }).click();
    await createResp;

    await expect(page.getByText('此帳號已被註冊，請換一個')).toBeVisible();
    await expect(page).toHaveURL(/\/register/);
  });

  test('可從註冊頁返回登入頁', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('link', { name: '立即登入' }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
