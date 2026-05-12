# 🌌 平行世界情绪驿站 - 部署说明

## 📱 项目概述
大学生心理健康网页项目，参加"软工杯 AI 小程序设计大赛"

## ✅ 已完成优化

### 1. 手机适配优化
- ✅ 添加 viewport-fit=cover 支持全面屏手机
- ✅ 添加 safe-area-inset 安全区域适配
- ✅ 优化底部导航栏高度，防止遮挡内容
- ✅ 弹幕区域调整为动态高度，避开导航栏
- ✅ 卡片内容自动换行，防止文字溢出
- ✅ 小屏幕（<375px）字体自适应缩小
- ✅ 添加 iOS Safari 全屏支持

### 2. 文件清单
```
mental_health_project/
├── index.html              # 首页（主页面）
├── identity.html           # 身份卡页面
├── qrcode_generate.html    # 二维码生成页面（新增）
├── generate_qrcode.py      # Python 二维码生成脚本（可选）
└── README.md               # 部署说明（本文件）
```

## 🚀 部署方法

### 方法一：本地测试（推荐用于开发）

1. **启动本地服务器**
   ```bash
   # 打开 PowerShell，进入项目目录
   cd C:\Users\SXY\Desktop\Code\Python\python_code\mental_health_project
   
   # 启动 HTTP 服务器（端口 8000）
   python -m http.server 8000
   ```

2. **访问页面**
   - 电脑浏览器：http://localhost:8000/index.html
   - 局域网手机访问：http://[电脑IP]:8000/index.html

3. **生成二维码**
   - 访问：http://localhost:8000/qrcode_generate.html
   - 页面会自动生成二维码
   - 可保存二维码图片或复制链接

### 方法二：GitHub Pages 部署（免费公网访问）

1. **创建 GitHub 仓库**
   - 访问 https://github.com
   - 创建新仓库，如：`emotion-station`

2. **上传项目文件**
   ```bash
   # 初始化 git 仓库
   git init
   git add .
   git commit -m "Initial commit"
   
   # 关联远程仓库
   git remote add origin https://github.com/你的用户名/emotion-station.git
   
   # 推送代码
   git push -u origin main
   ```

3. **启用 GitHub Pages**
   - 进入仓库 Settings → Pages
   - Source 选择 `main` 分支
   - 保存后等待几分钟
   - 获得访问地址：`https://你的用户名.github.io/emotion-station/index.html`

4. **生成二维码**
   - 访问：`https://你的用户名.github.io/emotion-station/qrcode_generate.html`
   - 保存二维码即可扫码访问

### 方法三：Vercel 部署（免费 CDN 加速）

1. **访问 Vercel**
   - https://vercel.com

2. **导入 GitHub 仓库**
   - 登录 Vercel
   - Import Project → 选择你的仓库
   - 点击 Deploy

3. **获得访问地址**
   - `https://emotion-station.vercel.app`

### 方法四：Netlify 部署（拖拽上传）

1. **访问 Netlify**
   - https://www.netlify.com

2. **拖拽部署**
   - 登录 Netlify
   - 直接将项目文件夹拖到部署区域
   - 自动生成访问地址

## 📱 手机访问步骤

### 局域网访问（电脑和手机在同一 WiFi）

1. **获取电脑 IP 地址**
   ```bash
   # Windows
   ipconfig
   # 找到 IPv4 地址，如：192.168.1.100
   ```

2. **手机访问**
   - 打开手机浏览器
   - 输入：`http://192.168.1.100:8000/index.html`
   - 或使用二维码扫码访问

3. **生成二维码**
   - 访问：`http://192.168.1.100:8000/qrcode_generate.html`
   - 页面会显示二维码
   - 手机扫码即可访问

### 公网访问（推荐用于比赛演示）

1. **使用 GitHub Pages / Vercel 部署**（见上方）
2. **获得公网 URL**
3. **生成二维码供评委扫码**

## 🔧 故障排查

### 手机无法访问局域网
- ✅ 确保手机和电脑连接同一 WiFi
- ✅ 关闭电脑防火墙或允许 8000 端口
- ✅ 检查 IP 地址是否正确

### 二维码扫码失败
- ✅ 确保 URL 完整正确
- ✅ 尝试复制链接手动访问
- ✅ 刷新页面重新生成二维码

### 页面显示不完整
- ✅ 清除浏览器缓存
- ✅ 使用最新版浏览器
- ✅ 检查手机横竖屏设置

## 📊 功能清单

### ✅ 保留功能
- ✅ 每日固定身份卡
- ✅ 生成二维码分享
- ✅ 完成挑战记录
- ✅ 保存海报到相册
- ✅ 情绪卡片翻转动画
- ✅ 漂浮弹幕效果
- ✅ 夜间/白天模式切换
- ✅ 底部导航栏

### ✅ 新增优化
- ✅ 手机端全面屏适配
- ✅ 安全区域自动适配
- ✅ 小屏幕字体优化
- ✅ 内容防遮挡布局
- ✅ 二维码生成页面
- ✅ 一键复制链接功能
- ✅ 二维码保存功能

## 🎯 比赛演示建议

### 演示流程
1. **展示二维码**（提前生成并打印）
2. **评委扫码访问**
3. **演示核心功能**：
   - 选择情绪
   - 翻转卡片
   - 完成挑战
   - 保存身份卡
   - 切换夜间模式

### 设备准备
- 手机提前连接 WiFi
- 准备扫码工具（微信/浏览器）
- 备用方案：准备电脑端演示

## 📞 技术支持

如有问题，请检查：
1. 浏览器控制台错误信息
2. 网络连接状态
3. 服务器是否正常运行

---

**部署完成时间**: 2026-05-12  
**项目版本**: v1.0  
**参赛组别**: 软工杯 AI 小程序设计大赛
