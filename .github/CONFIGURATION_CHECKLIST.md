# Cloudflare Pages 部署配置清单

## 📋 必需配置项

在使用 GitHub Actions 部署到 Cloudflare Pages 之前，请完成以下配置：

### 1. Cloudflare API Token (CF_PAGES_API_TOKEN)

**用途**: 授权 GitHub Actions 访问您的 Cloudflare 账户

**配置步骤**:
1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)
2. 点击右上角头像 → "My Profile"
3. 选择左侧菜单 "API Tokens"
4. 点击 "Create Token"
5. 选择 "Custom token"
6. 填写以下信息:
   - **Token name**: `github-actions-deploy`
   - **Permissions**:
     - Account > Pages > Edit
     - Account > Pages Deployments > Edit
     - Account > Pages Logs > Read
   - **Account Resources**: 选择您的账户
7. 点击 "Continue to summary"
8. 点击 "Create Token"
9. 复制生成的令牌

**在 GitHub 中配置**:
1. 进入您的 GitHub 仓库
2. 点击 "Settings" (设置)
3. 选择左侧 "Secrets and variables" → "Actions"
4. 点击 "New repository secret"
5. Name: `CF_PAGES_API_TOKEN`
6. Value: 粘贴刚才复制的令牌
7. 点击 "Add secret"

### 2. Cloudflare Account ID (CF_ACCOUNT_ID)

**用途**: 识别您的 Cloudflare 账户

**获取步骤**:
1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)
2. 在仪表板右下角找到 "Account ID"
3. 点击复制按钮

**在 GitHub 中配置**:
1. 在同一个 Secrets 页面
2. 点击 "New repository secret"
3. Name: `CF_ACCOUNT_ID`
4. Value: 粘贴 Account ID
5. 点击 "Add secret"

### 3. Cloudflare Project Name (CF_PROJECT_NAME)

**用途**: 指定要部署到的 Pages 项目

**说明**: 这是您在 Cloudflare Pages 中创建的项目名称

**在 GitHub 中配置**:
1. 在同一个 Secrets 页面
2. 点击 "New repository secret"
3. Name: `CF_PROJECT_NAME`
4. Value: 您的项目名称（例如：`prompt-studio`）
5. 点击 "Add secret"

## 🚀 部署流程

完成配置后，部署将自动进行：

1. **推送代码到 master 分支**
   ```bash
   git add .
   git commit -m "feat: update project"
   git push origin master
   ```

2. **GitHub Actions 自动触发**
   - 工作流会在 `.github/workflows/deploy.yml` 中定义
   - 自动安装依赖、构建项目、部署到 Cloudflare Pages

3. **查看部署状态**
   - 进入 GitHub 仓库的 "Actions" 标签
   - 查看 "Deploy to Cloudflare Pages" 工作流的执行状态

4. **访问部署的网站**
   - 部署成功后，页面 URL 会显示在 Actions 的 "Environment" 部分
   - 或者在 Cloudflare Pages 控制台查看

## 🔧 可选配置

### 自定义构建命令

如果您需要修改构建命令，可以：

1. 编辑 `.github/workflows/deploy.yml`
2. 修改 `run: pnpm build` 为您的自定义命令
   ```yaml
   - name: Build project
     run: pnpm build:custom
   ```

### 环境变量

如果您的应用需要环境变量：

1. 在 Cloudflare Pages 项目设置中配置
2. 或者在 GitHub Secrets 中添加（前缀 `VITE_`）
   ```
   VITE_API_URL=https://api.example.com
   VITE_APP_NAME=MyApp
   ```

### 多分支部署

如果您想在其他分支也启用自动部署：

1. 编辑 `.github/workflows/deploy.yml`
2. 修改 `on.push.branches` 配置
   ```yaml
   on:
     push:
       branches:
         - master
         - main
         - develop
   ```

## 🐛 故障排除

### 常见问题

1. **部署失败 - 权限错误**
   - 检查 `CF_PAGES_API_TOKEN` 是否有足够权限
   - 确认 Account ID 是否正确

2. **构建失败**
   - 查看 Actions 日志中的错误信息
   - 确保 `pnpm build` 在本地能正常执行

3. **找不到项目**
   - 确认 `CF_PROJECT_NAME` 是否与 Cloudflare Pages 中的项目名称一致
   - 检查项目是否已创建

### 获取帮助

如果遇到问题：

1. 查看 GitHub Actions 的详细日志
2. 检查 Cloudflare Pages 控制台的部署日志
3. 确认所有 Secrets 配置正确

## 📝 注意事项

- **安全性**: API Token 包含敏感信息，请勿泄露
- **权限最小化**: API Token 只授予必要的权限
- **项目命名**: 项目名称在 Cloudflare Pages 中必须唯一
- **分支策略**: 默认只在 master 分支触发部署

## 🎯 下一步

配置完成后：

1. 推送一次代码测试部署
2. 访问部署的网站确认功能正常
3. 根据需要调整配置

如有疑问，请参考：
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)