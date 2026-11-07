# 雅思口语 · 独立自动收件服务器

这个文件夹提供 Cloudflare Worker + 私有 R2 的服务端代码。**提交 GitHub 不等于服务器已部署**。需要你自己的 Cloudflare 账号授权部署。无需把密码发给任何人，也不要把密码写进 GitHub。

## 一次性上线

1. 登录 Cloudflare（https://dash.cloudflare.com/），启用 R2 服务（可能需设置计费信息）。
2. 在电脑终端（安装 Node.js 后）进入本文件夹：
   ```bash
   npx wrangler login
   npx wrangler r2 bucket create ielts-speaking-homework-private
   npx wrangler secret put SIGNING_KEY
   npx wrangler secret put ADMIN_PASSWORD
   npx wrangler deploy
   ```
   设置 SIGNING_KEY 为**独立随机长字符串**（建议至少 32 字节），ADMIN_PASSWORD 为**至少 16 位的强密码**。不要两项共用密码。
3. Wrangler 会给出真实的 `https://...workers.dev` URL。先浏览 `/health` 核对健康状态，再浏览 `/admin`，用户名固定 `teacher`，密码为刚才设的 ADMIN_PASSWORD。
4. **最后一步才切换网站**：在网站根目录 `recording-delivery.js` 中将 `UPLOAD_ORIGIN` 改成刚部署的 URL，同时将 `mail-check.html` 教师后台链接改成新 URL；更新 HTML 中引用的 JS 版本号，避免缓存继续访问旧服务器。
5. 打开 `https://murph232439.github.io/ielts-speaking-practice/mail-check.html`，提交无声测试录音，然后在新后台确认存在 **同一个编号**、可试听且逐字稿正确。再用手机和电脑各提交一条真实的授权测试录音，验证后才能通知学生恢复使用。

## 接口与功能
- `POST /api/ticket`: 请求带时限的签名上传凭证
- `POST /api/submissions`: 上传最多 10MB 音频，核实 SHA-256，服务端写入 **私有 R2** 的音频和逐字稿后才返回 `stored`
- `GET /admin`: 教师密码保护的收件箱，显示学生姓名、Part、题目、时间、逐字稿；可试听和下载
- `GET /health`: 健康检查；不代表已验证真实提交
- 录音仍有网页本机备份和下载通道，服务端不将音频公开到 GitHub

## 上线安全事项
- GitHub Pages 是静态站点，不能自行充当收件服务器；R2 保持非公开，禁止开放 bucket 公共访问。
- 上传接口面向公网；**上线前应在 Cloudflare 配置请求速率限制、Bot/WAF 规则和使用额度告警**，防止被刷上传。不要把管理密码或签名密钥放在前端。
- 录音和逐字稿含学生个人资料。应向学生说明用途、保留期限和删除渠道；建议教师建立保留期限和定期导出、清理安排。
- 目前没有邮件推送，也没有与原先旧后台的数据自动迁移；旧服务器数据不会凭空出现在新后台。
- 若网络中断，前端不会误报成功；保留下载链接及备用发送功能。
