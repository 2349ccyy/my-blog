/**
 * ML 知识图谱 — 全局交互逻辑
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initMobileMenu();
  initFadeInAnimations();
  initTreeNavigation();
});

/* ---------- 导航高亮 ---------- */
function initNavigation() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('.nav-links a');

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ---------- 移动端汉堡菜单 ---------- */
function initMobileMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-links');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    menu.classList.toggle('open');
  });

  // 点击菜单项后自动关闭
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
    });
  });

  // 点击外部关闭
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('open');
    }
  });
}

/* ---------- 卡片渐入动画 ---------- */
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

/* ---------- 树形导航交互 (ML知识页) ---------- */
function initTreeNavigation() {
  const treeNodes = document.querySelectorAll('.tree-node');
  const contentPanels = document.querySelectorAll('.content-panel');

  if (treeNodes.length === 0) return;

  // 折叠/展开
  treeNodes.forEach(node => {
    const header = node.querySelector('.tree-node-header');
    if (!header) return;

    header.addEventListener('click', (e) => {
      e.stopPropagation();

      // 如果节点有子节点，切换折叠状态
      const children = node.querySelector('.tree-children');
      if (children && children.children.length > 0) {
        node.classList.toggle('expanded');
      }

      // 切换内容面板
      const targetId = header.getAttribute('data-target');
      if (targetId) {
        showContentPanel(targetId);
        setActiveTreeNode(node);
      }
    });
  });

  // 移动端侧边栏开关
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
  // 确保父节点被展开
  let parent = node.parentElement;
  while (parent) {
    if (parent.classList.contains('tree-node')) {
      parent.classList.add('expanded');
    }
    parent = parent.parentElement;
  }
}
