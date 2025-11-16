import { test, expect } from '@playwright/test';

test.describe('版本创建流程', () => {
  test('用户应该能够创建项目并保存第一个版本', async ({ page }) => {
    await page.goto('/');

    // 等待页面加载
    await expect(page.getByText('Prompt Studio')).toBeVisible();

    // TODO: 实现完整 E2E 流程
    // 1. 点击"创建项目"按钮
    // 2. 输入项目名称
    // 3. 在编辑器中输入文本
    // 4. 按 Ctrl+Enter 保存
    // 5. 刷新页面
    // 6. 验证数据恢复
  });

  test('用户应该能够原地更新叶子节点', async ({ page }) => {
    await page.goto('/');

    // TODO: 实现完整 E2E 流程
    // 1. 创建版本
    // 2. 修改内容
    // 3. 按 Ctrl+Shift+Enter 原地保存
    // 4. 验证内容更新
  });
});
