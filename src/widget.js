const toggleButton = document.getElementById('toggleMainButton');
const menuButton = document.getElementById('widgetMenuButton');

toggleButton.addEventListener('click', () => {
  window.classScore.toggleMainWindow();
});

menuButton.addEventListener('click', () => {
  window.classScore.openWidgetMenu();
});

document.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  window.classScore.openWidgetMenu();
});

window.classScore.onWidgetState((payload) => {
  const modeClass = `mode-${payload.mode || 'idle'}`;
  toggleButton.className = `widget-button ${modeClass}`;
  toggleButton.title = payload.boardName
    ? `${payload.boardName} · ${payload.primaryText || '待命'}`
    : '显示或隐藏主窗口';
});
