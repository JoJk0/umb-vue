import Vue from '@vitejs/plugin-vue'
import UmbVue from 'umb-vue/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/App_Plugins/umb-vue-example/dist/',
  plugins: [
    Vue({
      features: { customElement: true },
      script: {
        defineModel: true,
      },
    }),
    UmbVue({
      include: ['./lib/**/*.ce.vue'],
      entries: ['lib/index.ts'],
      css: [],
    }),
    AutoImport({
      imports: ['vue', '@vueuse/core'],
      packagePresets: ['umb-vue'],
      dts: true,
      vueTemplate: true,
    }),
  ],
  build: {
    outDir: './umbraco/App_Plugins/umb-vue-example/dist',
  },
})
