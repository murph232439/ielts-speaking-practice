# 雅思口语 · 自动邮件收件服务器

目标邮箱：**wuxi2@xdf.cn**。学生点提交后，录音与逐字稿作为邮件附件通过 **Resend** 发送。保留私有 R2 备份和教师后台作为故障恢复途径，**教师日常不需要登录后台**。

**当前状态：代码已提交；邮件服务和 Worker 尚未配置部署，不能认为学生作业已可自动发邮箱。** 上线前请勿通知学生把成功提示当成已送达。

## 部署前必做

1. 登录 https://resend.com/ ，在 Domains 中验证一个你拥有管理权限的发信域名（必须按平台要求添加 SPF/DKIM DNS 记录）。该域名可以不同于收件邮箱域名 `xdf.cn`，不需要修改新东方的邮箱域名。
2. 在 Resend 生成 API Key。不要把它粘贴在聊天或 GitHub 仓库里。
3. 登录 https://dash.cloudflare.com/ 使用 Cloudflare Workers + R2，创建私有 bucket `ielts-speaking-homework-private`（不要公开访问）。
4. 本地进入本目录，执行：

```bash
npx wrangler login
npx wrangler r2 bucket create ielts-speaking-homework-private
npx wrangler secret put SIGNING_KEY
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put MAIL_FROM
npx wrangler deploy
```

其中 `SIGNING_KEY` 填独立随机长密钥；`ADMIN_PASSWORD` 填至少 16 位教师管理密码；`MAIL_FROM` 填 Resend 已验证域名下的真实发件地址，例如 `IELTS Homework <homework@你已验证的域名>`。**收件人固定在服务器中为 wuxi2@xdf.cn，不由学生输入。**

5. 部署完成后复制 Wrangler 给出的 Worker URL。将网站根目录 `recording-delivery.js` 的 `UPLOAD_ORIGIN` 改为该地址；更新 `index.html` 中 `recording-delivery.js` 的版本号（防止浏览器缓存旧代码）。
6. 使用 `mail-check.html` 先发送无声测试录音，**同时确认 Resend 出站记录和 wuxi2@xdf.cn 实际收到带两个附件的邮件**；再从手机测试正常录音、逐字稿和重复提交情况。

## 成功/失败语义

- `state: emailed` 只表示 Resend API 已受理此封邮件，并不表示邮箱已经送达；收件人是否收到以实际收件箱及邮件服务的 delivery 事件为准。
- 如果发送失败，音频仍保留在私有 R2 以及学生本机备份。学生可以点击重试，Resend 使用每次提交的唯一 Idempotency-Key 尽量避免重复投递。
- 邮件超过服务商附件配额、收件方拒收、发信域名未验证等情况都可能影响发送。学生可下载录音作为最终备份。
- 用户的录音属于个人资料：上线前应告知学生用途及保存期限，并限制教师后台访问、启用速率限制和定期清理。
- 原先在 `speaking-homework-inbox.wuxi232439.chatgpt.site` 的旧记录不会自动迁移。

## 接口
- `POST /api/ticket`: 签名上传票据
- `POST /api/submissions`: 10MB 内音频校验、存储、带附件发邮件，Resend 受理后返回 `state: emailed`
- `GET /admin`: 故障恢复时查询备份（需强密码）
- `GET /health`: Worker 健康状态
