(() => {
  "use strict";

  const GRID = 20;            // 网格数（20 x 20）
  const CELL = 25;            // 单格像素
  const BEST_KEY = "snake_best_score";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const overlay = document.getElementById("overlay");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlaySub = document.getElementById("overlaySub");
  const btnStart = document.getElementById("btnStart");
  const btnPause = document.getElementById("btnPause");
  const btnRestart = document.getElementById("btnRestart");
  const bonusBoxEl = document.getElementById("bonusBox");
  const bonusTimeEl = document.getElementById("bonusTime");

  let snake, dir, nextDir, food, score, best, state, timer, speed, bonus, boost;

  // state: "ready" | "running" | "paused" | "over"
  const DIRS = {
    up:    { x: 0,  y: -1 },
    down:  { x: 0,  y: 1 },
    left:  { x: -1, y: 0 },
    right: { x: 1,  y: 0 },
  };

  function init() {
    snake = [{ x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }];
    dir = DIRS.right;
    nextDir = dir;
    score = 0;
    speed = 160;
    bonus = null;
    boost = 0;
    bonusBoxEl.style.display = "none";
    best = Number(localStorage.getItem(BEST_KEY) || 0);
    bestEl.textContent = best;
    scoreEl.textContent = score;
    placeFood();
    draw();
  }

  function placeFood() {
    while (true) {
      const p = {
        x: Math.floor(Math.random() * GRID),
        y: Math.floor(Math.random() * GRID),
      };
      if (!snake.some(s => s.x === p.x && s.y === p.y)) {
        food = p;
        return;
      }
    }
  }

  // 生成加速道具(不与蛇、食物重叠;场上已有则不重复生成)
  function placeBonus() {
    if (bonus) return;
    for (let tries = 0; tries < 200; tries++) {
      const p = {
        x: Math.floor(Math.random() * GRID),
        y: Math.floor(Math.random() * GRID),
      };
      const onSnake = snake.some(s => s.x === p.x && s.y === p.y);
      if (!onSnake && !(food.x === p.x && food.y === p.y)) {
        bonus = p;
        setTimeout(() => { bonus = null; draw(); }, 8000);  // 8 秒后消失
        return;
      }
    }
  }

  function tick() {
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // 撞墙
    if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
      return gameOver();
    }
    // 撞自己（尾部即将移开时不算撞）
    const willEat = head.x === food.x && head.y === food.y;
    if (snake.some((s, i) => s.x === head.x && s.y === head.y &&
        (willEat ? i < snake.length - 1 : true))) {
      return gameOver();
    }

    snake.unshift(head);

    // 吃到加速道具:10 秒内双倍得分
    if (bonus && head.x === bonus.x && head.y === bonus.y) {
      boost = 10;
      bonus = null;
      bonusBoxEl.style.display = "inline-block";
      bonusTimeEl.textContent = boost;
    }

    if (willEat) {
      score += boost > 0 ? 20 : 10;   // 加速期间双倍得分
      scoreEl.textContent = score;
      if (score > best) {
        best = score;
        bestEl.textContent = best;
        localStorage.setItem(BEST_KEY, String(best));
      }
      placeFood();
      if (Math.random() < 0.4) placeBonus();   // 40% 概率刷出加速道具
      speed = Math.max(70, speed - 5);   // 越吃越快
      clearInterval(timer);
      timer = setInterval(tick, speed);
    } else {
      snake.pop();
    }

    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 网格底纹
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.06)";
    ctx.lineWidth = 1;
    for (let i = 1; i < GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(canvas.width, i * CELL);
      ctx.stroke();
    }

    // 食物（苹果，带光晕）
    const fx = food.x * CELL, fy = food.y * CELL;
    const glow = ctx.createRadialGradient(fx + CELL / 2, fy + CELL / 2, 2, fx + CELL / 2, fy + CELL / 2, CELL * 0.9);
    glow.addColorStop(0, "rgba(248, 113, 113, 0.55)");
    glow.addColorStop(1, "rgba(248, 113, 113, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(fx + CELL / 2, fy + CELL / 2, CELL * 0.9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(fx + CELL / 2, fy + CELL / 2, CELL * 0.34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.beginPath();
    ctx.arc(fx + CELL * 0.36, fy + CELL * 0.36, CELL * 0.09, 0, Math.PI * 2);
    ctx.fill();

    // 加速道具(金色光球)
    if (bonus) {
      const bx = bonus.x * CELL, by = bonus.y * CELL;
      const bglow = ctx.createRadialGradient(bx + CELL / 2, by + CELL / 2, 2, bx + CELL / 2, by + CELL / 2, CELL * 0.9);
      bglow.addColorStop(0, "rgba(250, 204, 21, 0.55)");
      bglow.addColorStop(1, "rgba(250, 204, 21, 0)");
      ctx.fillStyle = bglow;
      ctx.beginPath();
      ctx.arc(bx + CELL / 2, by + CELL / 2, CELL * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.arc(bx + CELL / 2, by + CELL / 2, CELL * 0.34, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.beginPath();
      ctx.arc(bx + CELL * 0.36, by + CELL * 0.36, CELL * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }

    // 蛇身（渐变）
    snake.forEach((seg, i) => {
      const t = i / Math.max(1, snake.length - 1);
      const r = Math.round(74 + t * 30);
      const g = Math.round(222 - t * 30);
      const b = Math.round(128 - t * 40);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL + 2, seg.y * CELL + 2, CELL - 4, CELL - 4, 5);
      ctx.fill();
    });

    // 蛇头（高亮）
    const h = snake[0];
    ctx.fillStyle = "#22d3ee";
    ctx.beginPath();
    ctx.roundRect(h.x * CELL + 2, h.y * CELL + 2, CELL - 4, CELL - 4, 5);
    ctx.fill();

    // 眼睛
    let ex = h.x * CELL + CELL / 2 + dir.x * 4;
    let ey = h.y * CELL + CELL / 2 + dir.y * 4;
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(ex - 4, ey, 2.6, 0, Math.PI * 2);
    ctx.arc(ex + 4, ey, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }

  function setState(s) {
    state = s;
    if (s === "running") {
      btnStart.textContent = "继续";
      btnStart.style.display = "none";
      btnPause.style.display = "inline-block";
      overlay.classList.add("hidden");
    } else if (s === "paused") {
      btnStart.style.display = "inline-block";
      btnStart.textContent = "继续";
    } else if (s === "ready") {
      btnStart.textContent = "开始";
      btnStart.style.display = "inline-block";
      overlayTitle.textContent = "🐍 贪吃蛇";
      overlaySub.textContent = "按「开始」或方向键开始游戏";
      overlay.classList.remove("hidden");
    } else if (s === "over") {
      btnStart.style.display = "inline-block";
      btnStart.textContent = "再来一局";
      overlayTitle.textContent = "💀 游戏结束";
      overlaySub.innerHTML = `得分 <b>${score}</b>${score >= best && score > 0 ? " · 🏆 新纪录！" : ""}`;
      overlay.classList.remove("hidden");
    }
  }

  function start() {
    if (state === "running") return;
    if (state === "over") init();
    if (state === "ready" && snake.length === 0) init();
    clearInterval(timer);
    timer = setInterval(tick, speed);
    setState("running");
  }

  function pause() {
    if (state !== "running") return;
    clearInterval(timer);
    setState("paused");
    overlayTitle.textContent = "⏸ 已暂停";
    overlaySub.textContent = "按「继续」或方向键继续";
    overlay.classList.remove("hidden");
  }

  function restart() {
    clearInterval(timer);
    init();
    setState("ready");
  }

  function gameOver() {
    clearInterval(timer);
    setState("over");
  }

  function setDir(name) {
    const d = DIRS[name];
    if (!d) return;
    if (state === "ready") return start();
    if (state === "over") return;
    if (state === "paused") {
      start();
      return;
    }
    // 不允许 180° 反向
    if (d.x === -dir.x && d.y === -dir.y) return;
    nextDir = d;
  }

  // 键盘控制
  const KEYMAP = {
    ArrowUp: "up", KeyW: "up", W: "up", w: "up",
    ArrowDown: "down", KeyS: "down", S: "down", s: "down",
    ArrowLeft: "left", KeyA: "left", A: "left", a: "left",
    ArrowRight: "right", KeyD: "right", D: "right", d: "right",
    Space: "space",
    KeyR: "restart",   // 新功能:按 R 键重新开始
  };
  document.addEventListener("keydown", (e) => {
    const action = KEYMAP[e.code];
    if (!action) return;
    e.preventDefault();
    if (action === "space") {
      state === "running" ? pause() : start();
      return;
    }
    if (action === "restart") {
      const password = "snake-123";   // 彩蛋密码
      console.log(password);          // 修复:拼写正确 → 两个错误同时消失
      restart();
      return;
    }
    setDir(action);
  });

  // 触屏滑动
  let touchStart = null;
  canvas.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    touchStart = { x: t.clientX, y: t.clientY };
  }, { passive: true });
  canvas.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });
  canvas.addEventListener("touchend", (e) => {
    if (!touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    touchStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;  // 忽略轻微滑动
    if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? "right" : "left");
    else setDir(dy > 0 ? "down" : "up");
  });

  btnStart.addEventListener("click", start);
  btnPause.addEventListener("click", pause);
  btnRestart.addEventListener("click", restart);

  // 加速道具倒计时(常驻,每秒刷新)
  setInterval(() => {
    if (boost > 0) {
      boost--;
      bonusTimeEl.textContent = boost;
      if (boost === 0) bonusBoxEl.style.display = "none";
    }
  }, 1000);

  init();
  setState("ready");
})();
