# 阶段性文档：主题切换功能（v0.2.0）

> **存档检查点约定**：本项目每完成一个新功能，立即在 `docs/milestones/` 下产出一份阶段性文档（功能清单 / 架构设计 / 技术选型 / 实现细节 / 验证记录），并与对应源代码**一并 commit + push**，形成可靠的存档检查点。文件命名：`YYYY-MM-DD-功能名.md`。

- **日期**：2026-08-18
- **功能**：深色 / 浅色主题一键切换
- **涉及文件**：`index.html`、`game.js`、`README.md`、本文件
- **状态**：已完成，随本文档一并提交存档

---

## 一、当前实现的功能

本次新增：

- 🌓 **主题切换**：右上角圆形按钮（🌙/☀️）或按 `T` 键，一键切换深色 / 浅色主题
- 💾 **偏好记忆**：用户选择写入 `localStorage`（键：`snake_theme`），刷新后保持
- 🖥️ **跟随系统**：首次访问（无存储值）时读取 `prefers-color-scheme` 媒体查询，自动匹配系统深浅色
- 🎨 **全量适配**：页面 UI（背景、面板、计分框、按钮、遮罩、提示文字）与 Canvas 棋盘（底色、网格线、蛇眼）同步切换
- ✨ **平滑过渡**：`background / color / border` 等属性带 0.3s 过渡动画

叠加此前版本，项目累计功能：

| 功能 | 引入版本 |
|------|---------|
| 经典贪吃蛇玩法（键盘 + 触屏） | v0.1.0 之前 |
| 得分 / 最高分（localStorage） | v0.1.0 之前 |
| 加速道具（10 秒双倍得分） | v0.1.0 之前 |
| 暂停 / R 键重开 | v0.1.0 |
| ESLint + pre-commit 质量门 | v0.1.0（工程化） |
| **主题切换（本文档）** | **v0.2.0** |

## 二、架构设计

```
┌─────────────────────────────────────────────┐
│  index.html                                 │
│  <html data-theme="dark|light">             │  ← 单一数据属性驱动全局主题
│  :root / html[data-theme=...] { --css 变量 } │  ← 两套变量定义,一处切换
│  所有样式规则统一引用 var(--xxx)              │
└──────────────────┬──────────────────────────┘
                   │ dataset.theme = t
┌──────────────────▼──────────────────────────┐
│  game.js — 主题模块                          │
│  resolveInitialTheme()  读 localStorage      │
│                         → 系统偏好 → 默认深色 │
│  applyTheme(t)          写属性+存储+重绘按钮  │
│  toggleTheme()          二态翻转             │
│                                             │
│  CANVAS_THEMES = { dark:{...}, light:{...} } │  ← Canvas 调色板
│  draw() 每帧从调色板取色,切换后立即重绘       │
└─────────────────────────────────────────────┘
```

关键设计决策：

1. **单一数据源**：主题真值只有两处——DOM 的 `data-theme` 属性（驱动 CSS）和 JS 内部 `theme` 变量（驱动 Canvas），由 `applyTheme()` 统一写入，杜绝状态不一致。
2. **CSS 变量层**：所有颜色收敛为 17 个 CSS 自定义属性，组件样式只引用变量不写死颜色。新增主题 = 新增一组变量值，零样式改动。
3. **Canvas 双轨**：Canvas 无法消费 CSS 变量，因此单独维护 `CANVAS_THEMES` 调色板对象，蛇身渐变/食物/道具等高饱和色两套主题通用，仅底色、网格线、蛇眼分主题。
4. **入口即初始化**：脚本启动时先 `applyTheme(resolveInitialTheme())` 再 `init()`，保证首帧就是正确主题。

## 三、技术选型

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 切换机制 | `data-theme` 属性 + CSS 变量 | 原生、零依赖；比切换 class 语义更明确，比 JS 逐个改样式可维护 |
| 偏好存储 | `localStorage` | 与最高分同一方案，简单同步；数据量小无需 cookie/indexedDB |
| 首次主题 | `matchMedia('(prefers-color-scheme: light)')` | 尊重用户系统设置，现代浏览器全支持 |
| 按钮图标 | Emoji（🌙/☀️） | 项目零外部资源的既定约束下最优解，避免引入图标库/图片 |
| 已知取舍 | 未做"跟随系统"常驻模式 | 用户显式选择后即固定；如需可扩展为 `auto/dark/light` 三态 |

## 四、实现细节

### 4.1 CSS（index.html）

- `:root, html[data-theme="dark"]` 定义深色变量（默认）；`html[data-theme="light"]` 覆盖为浅色值
- 主题差异项：页面渐变背景、面板底色/边框/阴影、计分框、棋盘边框、遮罩、提示文字、按钮渐变（浅色下加深以保证白字对比度）
- 过渡动画：`body / .game-wrap / .score-box / .board-wrap` 挂 `transition`，避免生硬跳变

### 4.2 JS（game.js）

```js
// 主题解析优先级：localStorage 显式选择 > 系统偏好 > 默认深色
function resolveInitialTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(t) {
  theme = t;
  document.documentElement.dataset.theme = t;   // 驱动全部 CSS 变量
  localStorage.setItem(THEME_KEY, t);           // 记忆偏好
  btnTheme.textContent = t === "dark" ? "☀️" : "🌙";  // 图标指向"将切换到"的主题
  if (ctx) draw();                              // 用新调色板重绘棋盘
}
```

- 键盘：`KEYMAP` 增加 `KeyT: "theme"`，keydown 分发至 `toggleTheme()`
- 按钮：`btnTheme` 圆形按钮置于计分区末尾，`click` 同样触发 `toggleTheme()`
- Canvas：`draw()` 开头取 `CANVAS_THEMES[theme]`，底纹、网格线、蛇眼均从调色板读色

### 4.3 交互细节

- 按钮图标显示的是**下一次**将切换到的主题（当前深色 → 显示 ☀️），符合"点我变亮"直觉
- 切换瞬间 `draw()` 立即重绘，游戏运行中切换不影响状态机与计时器

## 五、验证记录

| 检查项 | 结果 |
|--------|------|
| ESLint（`game.js`，含 `no-undef` / `no-unused-vars`） | ✅ 通过，0 error 0 warning |
| pre-commit 钩子（提交时自动触发） | ✅ 通过放行 |
| 深色 ⇄ 浅色切换（按钮 / T 键） | ✅ UI 与 Canvas 同步切换 |
| 刷新页面后主题保持 | ✅ localStorage 生效 |
| 首次访问跟随系统 | ✅ matchMedia 分支覆盖 |
| 游戏运行中切换主题 | ✅ 不中断游戏、状态完好 |

## 六、存档信息

- 提交信息：`feat: 主题切换(深色/浅色,记忆偏好) + 阶段性文档存档机制`
- 存档范围：功能代码（`index.html` / `game.js`）、文档（本文件）、`README.md` 同步更新
- 下一步候选：穿墙模式、障碍物关卡、游戏音效
