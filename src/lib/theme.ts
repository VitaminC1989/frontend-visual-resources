export const THEME_STORAGE_KEY = "fvr-theme";

/**
 * 在 <head> 中内联执行（渲染前），避免主题闪烁：
 * 优先读 localStorage，其次跟随系统；同时同步 .dark-mode 类供图标切换使用。
 */
export const themeInitScript = `(function(){var d=document.documentElement;try{var m=localStorage.getItem("${THEME_STORAGE_KEY}");if(m==="light"||m==="dark")d.dataset.theme=m}catch(e){}var t=d.dataset.theme;d.classList.toggle("dark-mode",t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches)})();`;
