import { test, expect } from '@playwright/test';

test.describe('版本树导航', () => {
  test('应该显示版本树并支持导航', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // 创建项目
    await page.click('button:has-text("创建项目")');
    await page.fill('input[placeholder*="项目名"]', 'Test Project');
    await page.click('button:has-text("确认")');

    // 创建多个版本
    await page.fill('textarea', 'Version 1');
    await page.keyboard.press('Control+Enter');
    
    await page.fill('textarea', 'Version 2');
    await page.keyboard.press('Control+Enter');

    // 检查版本树画布
    const canvas = page.locator('[data-testid="version-canvas"]');
    await expect(canvas).toBeVisible();

    // 检查版本节点
    const nodes = page.locator('.version-node');
    await expect(nodes).toHaveCount(2);

    // 点击节点切换版本
    await nodes.first().click();
    await expect(page.locator('textarea')).toHaveValue('Version 1');
  });

  test('应该支持画布缩放和平移', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // TODO: 实现缩放和平移测试
  });
});
