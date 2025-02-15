import { defineConfig } from 'vitepress'
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
} from 'vitepress-plugin-group-icons'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'UmbVue',
  description: 'Integrate Vue elements Umbraco Backoffice',
  lang: 'en-US',

  /* prettier-ignore */
  head: [
    ['link', { rel: 'icon', href: '/logo.svg' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/vitepress-logo-mini.svg' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/vitepress-logo-mini.png' }],
    ['meta', { name: 'theme-color', content: '#5f67ee' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:title', content: 'VitePress | Vite & Vue Powered Static Site Generator' }],
    ['meta', { property: 'og:site_name', content: 'VitePress' }],
    ['meta', { property: 'og:image', content: 'https://vitepress.dev/vitepress-og.jpg' }],
    ['meta', { property: 'og:url', content: 'https://vitepress.dev/' }],
    ['script', { src: 'https://cdn.usefathom.com/script.js', 'data-site': 'AZBRSFGG', 'data-spa': 'auto', defer: '' }]
  ],

  lastUpdated: true,
  cleanUrls: true,
  metaChunk: true,

  markdown: {
    config(md) {
      const fence = md.renderer.rules.fence!
      md.renderer.rules.fence = function (tokens, idx, options, env, self) {
        const { localeIndex = 'root' } = env
        const codeCopyButtonTitle = (() => {
          switch (localeIndex) {
            case 'es':
              return 'Copiar código'
            case 'fa':
              return 'کپی کد'
            case 'ko':
              return '코드 복사'
            case 'pt':
              return 'Copiar código'
            case 'ru':
              return 'Скопировать код'
            case 'zh':
              return '复制代码'
            default:
              return 'Copy code'
          }
        })()
        return fence(tokens, idx, options, env, self).replace(
          '<button title="Copy Code" class="copy"></button>',
          `<button title="${codeCopyButtonTitle}" class="copy"></button>`,
        )
      }
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
        indexName: 'main',
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
