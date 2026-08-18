# 🐍 贪吃蛇 (Snake Game)

一个纯 HTML / CSS / JavaScript 实现的经典贪吃蛇小游戏，**零依赖、单文件**，浏览器直接打开即可游玩。

## ✨ 功能特性

- 🎮 经典贪吃蛇玩法：方向键 / WASD 控制，手机端支持滑动
- 📈 得分与最高分记录（自动保存在浏览器 `localStorage`）
- ⚡ 每吃一个食物速度递增，越玩越刺激
- ⏸ 暂停 / 继续 / 重新开始
- 🚫 禁止 180° 反向，手感顺滑
- 🎨 深色霓虹风格 UI，Canvas 渲染，无外部资源

## 🕹️ 操作说明

| 操作 | 按键 |
|------|------|
| 移动 | 方向键 或 WASD |
| 暂停 / 继续 | 空格键 |
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
├── index.html   # 游戏本体（样式 + 逻辑全部内嵌）
└── README.md    # 项目说明
```

## 🛠️ 技术要点

- Canvas 2D 渲染，20×20 网格
- `setInterval` 驱动游戏循环，按分数动态调整速度
- 事件驱动：键盘监听 + 触屏手势识别
- 局部状态机：`ready → running ⇄ paused → over`

## 📄 License

MIT
