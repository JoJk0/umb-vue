import { defineConfig } from 'vitepress'
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
} from 'vitepress-plugin-group-icons'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'UmbVue',
  base: '/umb-vue/',
  description: 'Integrate Vue elements Umbraco Backoffice',
  lang: 'en-US',

  /* prettier-ignore */
  head: [
    ['link', { rel: 'icon', href: '/umb-vue/logo.svg' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/umb-vue/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#5f67ee' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:title', content: 'VitePress | Vite & Vue Powered Static Site Generator' }],
    ['meta', { property: 'og:site_name', content: 'VitePress' }],
    ['meta', { property: 'og:image', content: 'https://jojk0.github.io/umb-vue/logo.svg' }],
    ['meta', { property: 'og:url', content: 'https://jojk0.github.io/umb-vue' }],
    ['meta', { name: 'algolia-site-verification', content: 'C00CF830B3D383B1' }]
  ],

  lastUpdated: true,
  cleanUrls: true,
  metaChunk: true,

  markdown: {
    config(md) {
      md.use(groupIconMdPlugin)
    },
  },
  themeConfig: {
    aside: true,
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'API Reference', link: '/api' },
      { text: 'Examples', link: '/examples' },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/jojk0/umb-vue' }],

    logo: '/logo.svg',

    editLink: {
      text: 'Edit this page on GitHub',
      pattern: 'https://github.com/JoJk0/umb-vue/edit/main/docs/:path',
    },

    search: {
      provider: 'algolia',
      options: {
        appId: 'FJA32V32NV',
        apiKey: '3c24b843a30cfcd93f92b5987229d5ab',
        indexName: 'Docs',
      },
    },

    footer: {
      message: 'Released under the MIT License.',
    },

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/introduction' },
          { text: 'Umbraco Setup', link: '/umbraco-setup' },
          { text: 'Quickstart', link: '/quickstart' },
        ],
      },
      {
        text: 'Configuration',
        items: [{ text: 'Plugin options', link: '/plugin-options' }],
      },
    ],
  },

  vite: {
    plugins: [
      groupIconVitePlugin({
        customIcon: {
          rolldown: 'https://rolldown.rs/lightning-down.svg',
        },
      }),
    ],
  },
})
