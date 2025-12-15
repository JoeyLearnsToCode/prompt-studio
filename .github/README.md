# GitHub Actions 部署说明

本项目已配置 GitHub Actions 自动部署到 Cloudflare Pages。

## 工作流说明

工作流文件位于 `.github/workflows/deploy.yml`，包含以下步骤：

1. **触发条件**：当代码推送到 `master` 分支时自动触发
2. **构建阶段**：
   - 检出代码
   - 设置 Node.js 20 环境
   - 安装 pnpm
   - 缓存依赖
   - 安装项目依赖
   - 执行 `pnpm build` 构建项目
   - 上传构建产物到 GitHub Pages Artifact
3. **部署阶段**：
   - 使用 Cloudflare Pages Action 部署到 Cloudflare Pages

## 配置要求

在使用此工作流之前，您需要在 GitHub 仓库中配置以下 Secrets：

### 必需的 Secrets

1. **CF_PAGES_API_TOKEN**
   - 用途：Cloudflare API 令牌，用于授权部署操作
   - 如何获取：
     1. 登录 Cloudflare 控制台
     2. 进入 "My Profile" > "API Tokens"
     3. 点击 "Create Token"
     4. 选择 "Custom token"
     5. 设置权限：
        - Account > Pages > Edit
        - Account > Pages Deployments > Edit
        - Account > Pages Logs > Read
     6. 生成令牌并复制

2. **CF_ACCOUNT_ID**
   - 用途：Cloudflare 账户 ID
   - 如何获取：
     1. 登录 Cloudflare 控制台
     2. 进入 "Overview" 页面
     3. 在右下角找到 "Account ID"
     4. 复制该 ID

3. **CF_PROJECT_NAME**
   - 用途：Cloudflare Pages 项目名称
   - 说明：这是您在 Cloudflare Pages 中创建的项目名称
   - 示例：`prompt-studio`

### 可选配置

如果您想自定义构建命令或环境变量，可以：

1. 在 Cloudflare Pages 项目设置中配置环境变量
2. 或者修改工作流文件中的构建命令

## 部署流程

1. 推送代码到 `master` 分支
2. GitHub Actions 自动触发工作流
3. 工作流执行构建和部署
4. 部署完成后，您可以在 GitHub Actions 日志中查看部署状态
5. 部署成功的页面 URL 会显示在 Actions 的 "Environment" 部分

## 故障排除

如果部署失败，请检查：

1. **Secrets 配置是否正确**
   - 确保所有必需的 Secrets 都已正确配置
   - 检查 API Token 是否有足够权限

2. **构建错误**
   - 查看 GitHub Actions 日志中的构建输出
   - 确保 `pnpm build` 命令能正常执行

3. **Cloudflare Pages 项目配置**
   - 确认项目名称正确
   - 检查项目设置是否正确

## 手动触发

如果您想手动触发部署（不通过代码推送），可以：

1. 进入 GitHub 仓库的 "Actions" 标签
2. 选择 "Deploy to Cloudflare Pages" 工作流
3. 点击 "Run workflow"
4. 选择 `master` 分支并运行

## 其他分支部署

如果您想在其他分支上也启用自动部署，可以修改工作流文件中的 `on.push.branches` 配置：

```yaml
on:
  push:
    branches:
      - master
      - main
      - develop
```

## 性能优化

此工作流已包含以下优化：

1. **依赖缓存**：使用 pnpm 缓存加速依赖安装
2. **并行执行**：构建和部署阶段并行执行
3. **并发控制**：防止多个部署同时进行

## 相关文档

- [Cloudflare Pages 官方文档](https://developers.cloudflare.com/pages/)
- [Cloudflare Pages GitHub Actions](https://github.com/cloudflare/pages-action)
- [GitHub Actions 文档](https://docs.github.com/en/actions)