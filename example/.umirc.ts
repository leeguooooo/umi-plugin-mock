import { resolve } from 'path';
import { defineConfig } from 'umi';

export default defineConfig({
  plugins: ['umi-plugin-svgs'],
  mock: {
    entry: './src/assets/svg',
    ignorePath: '/api',
  },
});
