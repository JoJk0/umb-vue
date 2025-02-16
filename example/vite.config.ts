import Vue from '@vitejs/plugin-vue'
import UmbVue from 'umb-vue/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    Vue({
      features: { customElement: true },
      script: {
        defineModel: true,
      },
    }),
    UmbVue({
      umbracoDir: './umbraco',
      include: ['./lib/**/*.ce.vue'],
      entries: ['./lib/index.ts'],
      css: ['./lib/style.css'],
    }),
    AutoImport({
      imports: ['vue', '@vueuse/core'],
      packagePresets: ['umb-vue'],
      dts: true,
      vueTemplate: true,
    }),
  ],
})
