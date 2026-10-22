# macOS 屏幕录制授权

双击仓库中的 `scripts/grant-screen-recording.command`。它会查找本仓库正在运行的 Shiin 服务，沿进程父链识别实际宿主 App，打开「录屏与系统录音」，定位该 App 在第一组录屏列表里的开关，然后等待系统验证。

密码只在 macOS 原生窗口中输入。脚本通过 Shiin 的 `/api/permissions` 接口进行真实捕获复检；系统开关开启并不直接算成功。复检捕获使用后端现有临时文件机制，不保存截图到用户图库。

指定服务端口：

```sh
./scripts/grant-screen-recording.command --port 3817
```

只检查状态与宿主归属：

```sh
./scripts/grant-screen-recording.command --check
```

手动指定实际启动服务的宿主 App：

```sh
./scripts/grant-screen-recording.command --port 3817 --app /Applications/ChatGPT.app
```

系统设置自动操作已在 macOS 27.0.1 的简体中文界面验证。定位仅限第一组录屏列表，按 App 文件名精确匹配；不会把同名的「仅系统录音」开关当作录屏授权，也不会修改其他 App。系统布局不同、App 尚未列出或脚本宿主缺少自动化/辅助功能权限时，会停在设置页面并报告具体问题。

系统可能要求重新打开宿主 App。请先保存工作，再按系统提示重启；助手不会自行退出当前开发宿主。复检等待最多约三分钟（接口超时可能延长），未通过会返回非零退出码。

2026-10-22 本机检查记录：自动发现端口 3817，父链归属 `/Applications/ChatGPT.app`；只读检查确认录屏开关关闭，脚本已成功触发系统原生密码验证。用户验证和后端捕获成功需分别确认。
