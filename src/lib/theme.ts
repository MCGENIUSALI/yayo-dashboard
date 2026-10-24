/**
 * Inline script that applies the stored theme and sidebar state before first
 * paint, so neither flashes nor jumps on load.
 */
export const themeScript = `try{var d=document.documentElement,t=localStorage.getItem("yayo-theme");if(!t&&matchMedia("(prefers-color-scheme: dark)").matches)t="dark";d.dataset.theme=t||"light";if(localStorage.getItem("yayo-sidebar")==="collapsed")d.dataset.sidebar="collapsed"}catch(e){}`;

export const SIDEBAR_KEY = "yayo-sidebar";
