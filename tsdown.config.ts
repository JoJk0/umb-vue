import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/*.ts'],
  format: 'esm',
  target: 'node18.12',
  clean: true,
  dts: { transformer: 'oxc' },
  external: [
    /^@umbraco/,
    'vue',
    '@vue/shared',
    '@vue/compiler-sfc',
    './__global-styles',
  ],
})
