# 🐍 贪吃蛇 (Snake Game)

一个纯 HTML / CSS / JavaScript 实现的经典贪吃蛇小游戏，**零运行时依赖**，浏览器直接打开即可游玩。

## ✨ 功能特性

- 🎮 经典贪吃蛇玩法：方向键 / WASD 控制，手机端支持滑动
- 📈 得分与最高分记录（自动保存在浏览器 `localStorage`）
- ⚡ 每吃一个食物速度递增，越玩越刺激
- ✨ 加速道具：金色光球，吃到后 10 秒内双倍得分
- ⏸ 暂停 / 继续 / 重新开始
- 🚫 禁止 180° 反向，手感顺滑
- 🌓 深色 / 浅色主题一键切换，自动记忆偏好，首次访问跟随系统
- 🎨 霓虹风格 UI，Canvas 渲染，无外部资源

## 🕹️ 操作说明

| 操作 | 按键 |
|------|------|
| 移动 | 方向键 或 WASD |
| 暂停 / 继续 | 空格键 |
| 重新开始 | R 键 |
| 切换主题 | T 键 或 右上角 🌙/☀️ 按钮 |
| 触屏 | 在棋盘上滑动 |

## 🚀 运行方式

直接用浏览器打开 `index.html` 即可，无需安装任何依赖。

或使用本地静态服务器（可选）：

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .
```

然后访问 `http://localhost:8000`。

## 📁 项目结构

```
.
├── index.html           # 页面结构 + 样式（CSS 变量驱动的双主题）
├── game.js              # 游戏逻辑（Canvas 渲染、状态机、输入控制、主题切换）
├── docs/milestones/     # 阶段性文档（每个功能一份，随代码一起存档）
├── eslint.config.mjs    # ESLint 配置（语法检查：未定义变量等）
├── package.json         # npm 项目配置（仅开发依赖）
└── README.md            # 项目说明
```

## 🛠️ 开发:ESLint 检查

代码提交前会由 `pre-commit` 钩子自动对暂存的 JS 文件运行 ESLint，检查未定义变量、拼写错误等基础问题，**检查不通过则提交被中止**。

```bash
npm install          # 安装开发依赖（ESLint）
npx eslint game.js   # 手动运行检查
```

## 🛠️ 技术要点

- Canvas 2D 渲染，20×20 网格
- `setInterval` 驱动游戏循环，按分数动态调整速度
- 事件驱动：键盘监听 + 触屏手势识别
- 局部状态机：`ready → running ⇄ paused → over`

## 📄 License

MIT
