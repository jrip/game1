import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages serves this project from /game1/
  base: '/game1/',
  build: {
    // Improve compatibility with older mobile browsers/WebViews.
    target: 'es2018',
  },
});
