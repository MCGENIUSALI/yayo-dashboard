/** Inline script that applies the stored theme before first paint (no flash). */
export const themeScript = `try{var t=localStorage.getItem("yayo-theme");if(!t&&matchMedia("(prefers-color-scheme: dark)").matches)t="dark";document.documentElement.dataset.theme=t||"light"}catch(e){}`;
