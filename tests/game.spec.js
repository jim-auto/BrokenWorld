// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('ゲーム起動', () => {
  test('index.html が読み込め、JSエラーがない', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await expect(page).toHaveTitle(/十二番目の鐘が鳴る前に/);
    await expect(page.locator('#start-btn')).toBeVisible();
    await expect(page.locator('#load-error')).toBeHidden();

    expect(errors).toEqual([]);
  });

  test('「はじめる」でゲーム画面に遷移する', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await page.locator('#start-btn').click();

    await expect(page.locator('#title-screen')).toBeHidden();
    await expect(page.locator('#game-screen')).toBeVisible();
    await expect(page.locator('#game-canvas')).toBeVisible();
    await expect(page.locator('#dialogue-box')).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('ゲーム開始後に会話が表示される', async ({ page }) => {
    await page.goto('/');
    await page.locator('#start-btn').click();

    await expect(page.locator('#dialogue-text')).toContainText(/広場|指輪|届け/);
    await expect(page.locator('#phase-label')).toContainText(/序章/);
  });

  test('sprites.js に構文エラーがない', async ({ request }) => {
    const res = await request.get('/js/sprites.js');
    expect(res.ok()).toBeTruthy();
    const text = await res.text();
    expect(text).not.toMatch(/pebbleProp[\s\S]*?\]\),\s*'\_{12}'/);
    expect(text).toContain('export const SPRITES');
    expect(text).toContain('export const TILES');
  });
});

test.describe('プレイテストガイド', () => {
  test('playtest.html が表示される', async ({ page }) => {
    await page.goto('/playtest.html');
    await expect(page.locator('h1')).toContainText('十二番目の鐘が鳴る前に');
    await expect(page.locator('#walkthrough')).toBeVisible();
    await expect(page.locator('#checklist input')).toHaveCount(12);
  });

  test('ゲームへのリンクがある', async ({ page }) => {
    await page.goto('/playtest.html');
    const link = page.locator('a[href="index.html"]').first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/index\.html$/);
  });
});
