/**
 * 3D 卡片倾斜效果
 * 鼠标在卡片上移动时产生 perspective 旋转 + 光泽扫过
 * 移动端自动禁用
 */
document.addEventListener('DOMContentLoaded', () => {
  // 只在有精细指针设备（鼠标/触控板）时启用
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const SELECTOR = '.card, .blog-card, .entry-card, .stat-card, .content-card';

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

  function setupCard(card) {
    // 添加 glare 光泽层
    const glare = document.createElement('div');
    glare.className = 'card-glare';
    card.appendChild(glare);

    // 给卡片加标识类
    card.classList.add('card-3d');

    const handleMove = throttle(function (e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // 旋转角度：距中心越远越大，最大 ±6°
      const rotateY = ((x - centerX) / centerX) * 6;
      const rotateX = -((y - centerY) / centerY) * 6;

      card.style.transform =
        `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;

      // 光泽位置跟随鼠标
      if (glare) {
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        glare.style.background =
          `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.1) 0%, transparent 55%)`;
      }
    }, 20); // ~50fps

    card.addEventListener('mouseenter', function (e) {
      card.style.transition = 'none';
      handleMove(e);
    });

    card.addEventListener('mousemove', handleMove);

    card.addEventListener('mouseleave', function () {
      card.style.transition = 'transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)';
      card.style.transform =
        'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      if (glare) {
        glare.style.background = 'transparent';
      }
    });
  }

  // 初始化所有卡片
  document.querySelectorAll(SELECTOR).forEach(setupCard);

  // 观察后续动态加入的卡片（如 AJAX 加载）
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      m.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          if (node.matches && node.matches(SELECTOR)) setupCard(node);
          if (node.querySelectorAll) {
            node.querySelectorAll(SELECTOR).forEach(setupCard);
          }
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
});
