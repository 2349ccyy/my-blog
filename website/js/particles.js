/**
 * 神经网络粒子背景 — Canvas 动画
 * 模拟神经元节点 + 突触连接，鼠标吸引交互
 */
class NeuralParticles {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.nodes = [];
    this.mouse = { x: -2000, y: -2000 };
    this.mouseOnCanvas = false;

    this.nodeCount = options.nodeCount || 55;
    this.connectDist = options.connectDist || 140;
    this.mouseRadius = options.mouseRadius || 180;
    this.nodeColor = options.nodeColor || '79, 143, 247';
    this.lineColor = options.lineColor || '79, 143, 247';

    this.width = 0;
    this.height = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2); // 限制像素比保证性能
    this.animationId = null;
    this.running = true;

    this.init();
  }

  init() {
    this.resize();
    this.createNodes();
    this.bindEvents();
    this.animate();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
  }

  createNodes() {
    this.nodes = [];
    for (let i = 0; i < this.nodeCount; i++) {
      this.nodes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2.2 + 0.8,
        // 部分节点用亮色（"激活的神经元"）
        bright: Math.random() < 0.12,
      });
    }
  }

  bindEvents() {
    // 响应窗口大小变化
    window.addEventListener('resize', () => this.resize());

    // 鼠标跟踪
    const parent = this.canvas.parentElement;
    parent.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.mouseOnCanvas = true;
    });
    parent.addEventListener('mouseleave', () => {
      this.mouseOnCanvas = false;
    });

    // 页面不可见时暂停动画
    document.addEventListener('visibilitychange', () => {
      this.running = !document.hidden;
      if (this.running) this.animate();
    });
  }

  animate() {
    if (!this.running) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // 更新节点位置
    for (const node of this.nodes) {
      // 自然漂移
      node.x += node.vx;
      node.y += node.vy;

      // 边界反弹
      if (node.x < 0) { node.x = 0; node.vx *= -1; }
      if (node.x > this.width) { node.x = this.width; node.vx *= -1; }
      if (node.y < 0) { node.y = 0; node.vy *= -1; }
      if (node.y > this.height) { node.y = this.height; node.vy *= -1; }

      // 鼠标吸引
      if (this.mouseOnCanvas) {
        const dx = this.mouse.x - node.x;
        const dy = this.mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.mouseRadius && dist > 0) {
          const force = (1 - dist / this.mouseRadius) * 0.03;
          node.vx += (dx / dist) * force;
          node.vy += (dy / dist) * force;
        }
      }

      // 速度阻尼
      node.vx *= 0.999;
      node.vy *= 0.999;

      // 限制最大速度
      const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
      if (speed > 1.2) {
        node.vx = (node.vx / speed) * 1.2;
        node.vy = (node.vy / speed) * 1.2;
      }
    }

    // 绘制连线（神经元间的突触）
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const a = this.nodes[i];
        const b = this.nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.connectDist) {
          const alpha = (1 - dist / this.connectDist) * 0.25;
          this.ctx.beginPath();
          this.ctx.moveTo(a.x, a.y);
          this.ctx.lineTo(b.x, b.y);
          this.ctx.strokeStyle = `rgba(${this.nodeColor}, ${alpha})`;
          this.ctx.lineWidth = 0.6;
          this.ctx.stroke();
        }
      }
    }

    // 绘制节点
    for (const node of this.nodes) {
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

      if (node.bright) {
        // "激活"的神经元：更亮 + 光晕
        this.ctx.fillStyle = `rgba(${this.nodeColor}, 0.9)`;
        this.ctx.fill();
        // 外发光
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, node.radius * 2.5, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${this.nodeColor}, 0.15)`;
        this.ctx.fill();
      } else {
        this.ctx.fillStyle = `rgba(${this.nodeColor}, 0.45)`;
        this.ctx.fill();
      }
    }

    // 鼠标光标绘制（小型发光点）
    if (this.mouseOnCanvas) {
      this.ctx.beginPath();
      this.ctx.arc(this.mouse.x, this.mouse.y, 3, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${this.nodeColor}, 0.7)`;
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(this.mouse.x, this.mouse.y, 12, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${this.nodeColor}, 0.12)`;
      this.ctx.fill();
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('hero-particles');
  if (canvas) {
    // 移动端减少节点数
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    new NeuralParticles(canvas, {
      nodeCount: isMobile ? 25 : 55,
      connectDist: isMobile ? 100 : 140,
    });
  }
});
