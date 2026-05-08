import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://slesaad.github.io',
  trailingSlash: 'never',
  build: {
    format: 'directory',
  },
});
