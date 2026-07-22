/**
 * ML 知识图谱 — 全局交互逻辑
 * 含：导航 · 菜单 · 动画 · 鼠标光晕 · 进度条 · 打字机 · 数字计数 · 标签浮动
 */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  initNavigation();
  initMobileMenu();
  initFadeInAnimations();
  initTreeNavigation();
  initScrollProgress();

  // 仅在用户未请求减弱动画时启用动效
  if (!prefersReduced) {
    initMouseGlow();
    initTypingEffect();
    initCountAnimation();
    initTagFloat();
  }
});

/* ==================================================================
   工具函数
   ================================================================== */

/** 节流：限制函数调用频率 */
function throttle(fn, delay) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn.apply(this, args);
    }
  };
}

/** 检测是否为触摸设备 */
function isTouchDevice() {
  return !window.matchMedia('(pointer: fine)').matches;
}

/* ==================================================================
   导航高亮
   ================================================================== */
function initNavigation() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('.nav-links a');

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

/* ==================================================================
   移动端汉堡菜单
   ================================================================== */
function initMobileMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-links');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    menu.classList.toggle('open');
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
    });
  });

  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('open');
    }
  });
}

/* ==================================================================
   卡片渐入动画
   ================================================================== */
function initFadeInAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

/* ==================================================================
   树形导航交互 (ML知识页)
   ================================================================== */
function initTreeNavigation() {
  const treeNodes = document.querySelectorAll('.tree-node');
  const contentPanels = document.querySelectorAll('.content-panel');

  if (treeNodes.length === 0) return;

  treeNodes.forEach(node => {
    const header = node.querySelector('.tree-node-header');
    if (!header) return;

    // 使 tree-node-header 可通过键盘聚焦
    header.setAttribute('tabindex', '0');
    header.setAttribute('role', 'treeitem');

    const activateNode = (e) => {
      e.stopPropagation();

      const children = node.querySelector('.tree-children');
      if (children && children.children.length > 0) {
        node.classList.toggle('expanded');
        header.setAttribute('aria-expanded', node.classList.contains('expanded') ? 'true' : 'false');
      }

      const targetId = header.getAttribute('data-target');
      if (targetId) {
        showContentPanel(targetId);
        setActiveTreeNode(node);
      }
    };

    header.addEventListener('click', activateNode);

    // 键盘支持：Enter/Space 激活节点
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateNode(e);
      }
    });
  });

  const mobileToggle = document.querySelector('.tree-mobile-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
}

function showContentPanel(targetId) {
  const panels = document.querySelectorAll('.content-panel');
  panels.forEach(p => {
    p.style.display = p.id === targetId ? 'block' : 'none';
  });
}

function setActiveTreeNode(node) {
  document.querySelectorAll('.tree-node').forEach(n => n.classList.remove('active'));
  node.classList.add('active');
  let parent = node.parentElement;
  while (parent) {
    if (parent.classList.contains('tree-node')) {
      parent.classList.add('expanded');
    }
    parent = parent.parentElement;
  }
}

/* ==================================================================
   滚动进度条
   ================================================================== */
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.prepend(bar);

  const update = throttle(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) {
      bar.style.width = '0%';
      return;
    }
    const progress = Math.min((scrollTop / docHeight) * 100, 100);
    bar.style.width = progress + '%';
  }, 20);

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
}

/* ==================================================================
   鼠标跟随光晕
   ================================================================== */
function initMouseGlow() {
  if (isTouchDevice()) return;

  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  let active = false;

  const onMove = throttle((e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
    if (!active) {
      active = true;
      glow.classList.add('active');
    }
  }, 30);

  document.addEventListener('mousemove', onMove, { passive: true });

  document.addEventListener('mouseleave', () => {
    active = false;
    glow.classList.remove('active');
  });

  document.addEventListener('mouseenter', () => {
    active = true;
    glow.classList.add('active');
  });
}

/* ==================================================================
   终端打字机效果 (首页)
   ================================================================== */
function initTypingEffect() {
  const target = document.getElementById('typing-target');
  if (!target) return;

  const textsAttr = target.getAttribute('data-texts');
  if (!textsAttr) return;

  const texts = textsAttr.split('|').map(s => s.trim());
  const cursor = document.querySelector('.typing-cursor');

  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let currentText = '';

  function type() {
    const fullText = texts[textIndex];

    if (isDeleting) {
      currentText = fullText.substring(0, charIndex - 1);
      charIndex--;
    } else {
      currentText = fullText.substring(0, charIndex + 1);
      charIndex++;
    }

    target.textContent = currentText;

    let delay = isDeleting ? 35 : 70 + Math.random() * 50;

    if (!isDeleting && charIndex === fullText.length) {
      // 打完，停顿 2s 后开始删除
      delay = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      // 删完，停顿 0.5s 后打下一句
      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
      delay = 500;
    }

    setTimeout(type, delay);
  }

  // 初始延迟后开始
  setTimeout(type, 600);
}

/* ==================================================================
   数字滚动计数动画 (首页统计区)
   ================================================================== */
function initCountAnimation() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateNumber(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => observer.observe(el));
}

function animateNumber(el) {
  const raw = el.textContent.trim();

  // "∞" 特殊处理：脉冲动画
  if (raw === '∞') {
    el.style.animation = 'number-pulse 2s ease-in-out infinite';
    return;
  }

  // 解析目标数字和后缀
  const match = raw.match(/^(\d+)(.*)$/);
  if (!match) return;

  const target = parseInt(match[1], 10);
  const suffix = match[2] || '';
  const duration = 1500; // ms
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // easeOutExpo: 先快后慢
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const current = Math.round(eased * target);

    el.textContent = current + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target + suffix;
    }
  }

  requestAnimationFrame(update);
}

/* ==================================================================
   标签浮动动画 (技能栈页)
   ================================================================== */
function initTagFloat() {
  const tags = document.querySelectorAll('.tag-cloud .tag');
  if (tags.length === 0) return;

  tags.forEach(tag => {
    tag.classList.add('tag-floating');
    // 随机周期 3~6s
    tag.style.setProperty('--float-duration', (3 + Math.random() * 3).toFixed(1) + 's');
    // 随机延迟 0~3s
    tag.style.setProperty('--float-delay', (Math.random() * 3).toFixed(1) + 's');
  });
}
