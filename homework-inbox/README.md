# 雅思口语作业自动邮件：不需要购买域名

**目的**：学生在 https://murph232439.github.io/ielts-speaking-practice/ 提交录音和逐字稿，自动发送邮件到 **wuxi232439@gmail.com**（两个附件）。发送方是教师授权的 Google 邮箱。学生不会看到教师的 Gmail 密码，也不必登录 Google。

**当前阶段：代码已写入 GitHub，但尚未部署**。在完成账号授权与成功收件测试之前，正式网站继续指向旧收件服务，不应告诉学生“已经恢复”。

架构：
浏览器 HTTPS → Cloudflare Worker（校验上传、R2 私有备份） → Google Apps Script（MailApp 发附件） → wuxi232439@gmail.com。

## 第一步：部署 Google Apps Script 邮件代理
1. 使用**你控制的 Google/Gmail 账号**登录 https://script.google.com/ ，新建项目「IELTS Homework Mailer」。
2. 把 `google-apps-script/Code.gs` 的全部内容粘贴到 Apps Script 编辑器。
3. 项目设置 → 脚本属性（Script properties），新增 `INBOX_SECRET`，值为你自行生成的**32 位以上随机字符串**。该值是服务器之间的口令，**绝不能写入 GitHub、前端 JS 或聊天记录**。
4. 部署 → 新建部署 → 类型：网络应用（Web app）→ 执行身份：我（Me）→ 访问权限：任何人（Anyone）。首次部署时授权 **发送邮件** 权限。访问设为 Anyone 的原因是 Cloudflare Worker 从服务器发请求，不是 Google 登录用户；服务端脚本会校验秘密口令。不建议单独将 Apps Script URL 用于学生端。
5. 保存生成的 **`https://script.google.com/macros/s/.../exec`** URL。不要使用 /dev 链接。

## 第二步：部署 Cloudflare Worker + R2
1. 登录 https://dash.cloudflare.com/ （该账号不需要购买域名），启用 Workers 和 R2。按控制台提示开通并检查额度。
2. 电脑装好 Node.js，在本文件夹执行：

```bash
npx wrangler login
npx wrangler r2 bucket create ielts-speaking-homework-private
npx wrangler secret put SIGNING_KEY
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put GAS_WEB_APP_URL
npx wrangler secret put GAS_SHARED_SECRET
npx wrangler deploy
```

- `SIGNING_KEY`: 与邮件密钥不同的随机长字符串（至少32字节）。
- `ADMIN_PASSWORD`: 私有备份收件后台密码，至少16位。
- `GAS_WEB_APP_URL`: 第一步获得的 Apps Script `/exec` URL。
- `GAS_SHARED_SECRET`: 与 Apps Script `INBOX_SECRET` **完全一致**的口令。
- **不要在公开仓库中写入以上内容**。Worker 的 `wrangler.toml` 已配置 R2 的私有 bucket 名称。
- Cloudflare 的控制台提供的 `https://...workers.dev` URL 就是新收件服务器地址；不用买域名。

## 第三步：更换网站的收件地址（只有部署完成后）
1. 在仓库根目录 `recording-delivery.js` 把 `UPLOAD_ORIGIN` 改成你刚部署的 Workers URL。
2. 更改 `index.html` 和 `mail-check.html` 中脚本的版本参数以避免旧浏览器缓存。
3. 访问 `https://murph232439.github.io/ielts-speaking-practice/mail-check.html` 提交无声测试音频。
4. 检查 **wuxi232439@gmail.com 实际收到邮件的音频 + 逐字稿 TXT**，同时检查 Google 发件账号的“已发送”；最好分别用手机和电脑再做一次授权测试。
5. 检查网络断开、错误重试、同一提交编号重试的情况。全部通过后才通知学生恢复线上提交。

## 已实现的收件逻辑
- 学生点击一次提交；录音和文本自动作为邮件附件发给 `wuxi232439@gmail.com`。
- 服务器在 Worker 私有 R2 存储备份音频和文本；邮件接口报告失败时学生仍可下载或重新提交。
- Apps Script 通过脚本属性校验服务端口令，固定收件人，不接受学生自行指定邮件地址。
- Apps Script 对同一个提交编号采用 Script Properties 与 LockService 去重（不是绝对的分布式事务保障）。
- Worker 只有在 Apps Script 报告 `accepted` 后才返回成功。**这表示 Google 邮件发送函数未抛出异常，不代表收件箱一定送达**。
- 如需查询备份，可用 Worker `/admin` + 教师密码；日常不需要登录后台。
- 学生本机录音下载、IndexedDB 备份与备用分享继续保留。

## 重要限制
- Google 官方 Apps Script 邮件配额可能变化：当前个人账号约每日100名收件人，Workspace约每日1500名；每封邮件总附件不超过25MB，本站单录音上限10MB。大量学生同时提交可能触及配额。
- 邮件服务运行身份是你授权的 Google 账号；**不能直接冒用 `@xdf.cn` 发件身份**。学校邮箱仅为收件人。
- 面向公网的上传 API 仍需设置 Cloudflare WAF/速率限制和预算告警，否则可能滥用。
- 涉及学生录音及姓名，应告知用途，限制保存期限、访问权限和清理方式。
- 如果你的 Google 账号禁止公开网络应用部署，这个方案可能受管理员限制，需要更换发信账号或邮件服务。

官方参考：
- https://developers.google.com/apps-script/guides/web
- https://developers.google.com/apps-script/reference/mail/mail-app
- https://developers.google.com/apps-script/guides/services/quotas
