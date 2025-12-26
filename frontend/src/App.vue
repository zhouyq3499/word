<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="scss">
/* --------------  全局一次性缩放  -------------- */
html {
  /* 375px→10px, 768px→14px, 1440px→16px 自动插值 */
  font-size: clamp(10px, 0.9vw + 6px, 16px);
}

:root {
  --primary: #6fa8ff;
  --glass: rgba(240, 248, 255, 0.7);
  --radius: 0.5rem;
  --space-xs: 0.4rem;
  --space-sm: 0.8rem;
  --space: 1.2rem;
  --space-lg: 1.6rem;
  --space-xl: 2rem;
  --text-base: 1rem;
  --text-lg: 1.2rem;
  --text-xl: 1.4rem;
  --text-xxl: 1.6rem;
}

@mixin btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-sm) var(--space-lg);
  font-size: var(--text-base);
  border-radius: var(--radius);
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  background: var(--primary);
  color: #fff;
  &:hover {
    opacity: 0.9;
  }
}

@mixin card {
  background: var(--glass);
  border-radius: var(--radius);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

#app {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f8ff, #e6f3ff);
  padding: var(--space);
}
</style>