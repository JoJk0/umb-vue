import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/*.ts'],
  format: 'esm',
  target: 'es2022',
  clean: true,
  platform: 'browser',
  dts: { transformer: 'oxc' },
  external: [
    /^node:/,
    /^@umbraco/,
    'vue',
    '@vue/shared',
    '@vue-macros/common',
    '#global-styles',
    '/__lib',
  ],
})
