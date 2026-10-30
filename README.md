# 四象限待办 · 可部署 PWA 版

一个文件夹就是全部：`index.html`（单文件应用）+ `manifest.webmanifest`（应用配置）+ `sw.js`（离线缓存）+ `icons/`（图标）。零构建、零依赖、零后端。

## 文件

```
四象限待办-pwa/
├── index.html            # 应用本体（样式脚本全内嵌，已挂 manifest 与 Service Worker）
├── manifest.webmanifest  # PWA 配置：应用名、图标、独立窗口、主题色
├── sw.js                 # Service Worker：离线可用，有新版会提示刷新
└── icons/
    ├── icon-192.png / icon-512.png        # 安装图标（any）
    ├── icon-maskable-512.png              # Android 自适应图标（maskable）
    ├── apple-touch-icon.png               # iOS 主屏图标 180×180
    └── favicon-48.png / icon-96.png       # 浏览器标签页图标
```

## 怎么部署（三选一，都免费）

**A. Netlify Drop（最快，拖文件夹）**
1. 打开 <https://app.netlify.com/drop>
2. 把整个 `四象限待办-pwa` 文件夹拖进去
3. 得到一个 `https://xxx.netlify.app` 地址，完成

**B. GitHub Pages**
```bash
# 建一个仓库，把 四象限待办-pwa 里的内容放到仓库根目录，然后：
git init && git add . && git commit -m "todo pwa"
git remote add origin https://github.com/<你>/<仓库>.git
git push -u origin main
# 仓库 Settings → Pages → Source 选 "Deploy from a branch" → main → Save
```

**C. Vercel / Cloudflare Pages**：CLI 或网页上传同一个文件夹即可。

> 必须是 **https**（或 `localhost`）——Service Worker 在 `file://` 本地打开时无法注册，这是浏览器的规定，不是本项目的限制。

## 部署后怎么"装成应用"

| 平台 | 操作 |
|---|---|
| **Android / Chrome 桌面** | 地址栏右侧出现安装图标 → 点「安装」；或菜单 →「安装应用」 |
| **iPhone / iPad（Safari）** | 分享按钮 → 「添加到主屏幕」 |
| **Mac（Chrome）** | 地址栏安装图标 → Install |
| **macOS /iOS 快捷方式** | Safari 分享 → 「添加到主屏幕」 |

装好后：独立窗口、无地址栏、有自己的图标和启动底色（`#E4ECF5`）。

## 已验证

用 Playwright 对 `http://127.0.0.1:8137` 实测：

- Service Worker `activated` 且接管页面；`Page.getInstallabilityErrors` 返回 **空数组**（Chromium 判定可安装）；`Page.getAppManifest` 无错误
- manifest 200、4 个图标全部 200、图标像素尺寸正确（192/512/512maskable/180）
- **断网刷新仍能打开**（4 象限、13 条任务都在）
- 断网后新增任务仍可用（数据在 localStorage，与 SW 无关）
- 控制台零报错、零请求失败；正文/标签字号与对比度达标；`design_lint` 无红灯

## 数据存哪

任务存在浏览器的 **localStorage**（按源隔离），不上传任何服务器。换设备/清缓存会丢，需要多端同步的话要另加后端，那就不在本项目范围内了。

## 更新版本

改了 `index.html` 或 `sw.js` 后，把 `sw.js` 顶部的 `CACHE` 名字改一下（如 `siwei-todo-v2`）再部署，老缓存会被自动清掉；已安装的用户会看到「有新版本，刷新即可更新」的提示。
