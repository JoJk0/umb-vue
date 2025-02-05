<img src="./logo.svg" alt="umb-vue" style="width: 10em; display: block; margin: 3em auto;" />

<h1 style="text-align: center;">
  <code>umb-vue</code>
  <p style="font-size: 0.7em; line-height: 3">Umbraco integration for Vue.js</p>
</h1>


[![npm](https://img.shields.io/npm/v/umb-vue.svg)](https://npmjs.com/package/umb-vue)

[![Unit Test](https://github.com/sxzz/unplugin-starter/actions/workflows/unit-test.yml/badge.svg)](https://github.com/jojk0/umb-vue/actions/workflows/unit-test.yml)

Vue.js integrations for [Umbraco CMS](https://docs.umbraco.com/umbraco-cms) 14+ Backoffice.

## 🚧 DISCLAIMER 🚧
**This package is in active development and is not ready for any use at the moment.**

## Background

As [Umbraco 14 has been shipped](https://umbraco.com/blog/umbraco-14-release/), their Backoffice has been completely rewritten to use custom elements with [Lit](https://lit.dev/). This enables to use any framework of choice inside Umbraco Backoffice, allowing endless possibilities for integrations. Through [Extension Manifests](https://docs.umbraco.com/umbraco-cms/customizing/extending-overview/extension-registry/extension-manifest), any functionality inside the Backoffice can be extended, or new features created altogether. Due to Vue's excellent performance and [ease of use as Custom Elements](https://vuejs.org/guide/extras/web-components), its components can be seamlessly integrated into Umbraco Backoffice. This package removes the need to handle with Lit Elements and allows to use Umbraco integrations directly inside Vue files. 

## Features

- 🧩 Vue SFC custom elements as Umbraco Extensions
- 🔗 Access Umbraco Backoffice APIs via Vue composables
- 🤖 Auto-registration and bundling of extensions
- Vue SFCs as Umbraco Extensions
  - `defineManifest` Vue SFC macro for auto-registration of elements - takes filename as element name by default + prefix; Configure builder as a library with auto-imported extensions
  - `useContext` composable to access Umbraco Contexts (including custom)
    - `Observable`s are `computed` properties, auto-observing
    - Context instance methods are available at component `created` (or `setup()` function) time
  - `getHostElement` to access element's Umbraco Controller
  - `v-model` sugar of property editor UIs - `value` and auto-dispatch `property-value-change`

## Installation

```bash
pnpm i -D umb-vue
```

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import UmbVue from 'umb-vue/vite'

export default defineConfig({
  plugins: [UmbVue()],
})
```

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import UmbVue from 'umb-vue/rollup'

export default {
  plugins: [UmbVue()],
}
```

<br></details>

<details>
<summary>Rolldown</summary><br>

```ts
// rolldown.config.js
import UmbVue from 'umb-vue/rolldown'

export default {
  plugins: [UmbVue()],
}
```

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
import { build } from 'esbuild'
import UmbVue from 'umb-vue/esbuild'

build({
  plugins: [UmbVue()],
})
```

<br></details>

<details>
<summary>Webpack</summary><br>

```js
// webpack.config.js
import UmbVue from 'umb-vue/webpack'

export default {
  /* ... */
  plugins: [UmbVue()],
}
```

<br></details>

<details>
<summary>Rspack</summary><br>

```ts
// rspack.config.js
import UmbVue from 'umb-vue/rspack'

export default {
  /* ... */
  plugins: [UmbVue()],
}
```

<br></details>

## Setup

In your Umbraco project folder, create `App_Plugins` folder, with another folder inside it with your preferred name e.g. `my-package`, with `umbraco-package.json` inside of it with the following content:

```json
{
    "$schema": "../../umbraco-package-schema.json",
    "name": "My Project Name",
    "version": "0.1.0",
    "extensions": [
        {
            "type": "bundle",
            "alias": "My.Project.Bundle",
            "name": "My Bundle",
            "js": "/App_Plugins/my-package/dist/index.js"
        }
    ]
}
```

Then, as a separate project, create a dev environment of your choice and configure it accordingly. 

Most importantly, your bundler should:

- output built files to the `./My.Umbraco.Project/App_Plugins/my-package/dist`,
- have `/App_Plugins/my-package` to be set as a base URL,
- any module starting with `@umbraco` should be externalized
  
Here is an example for Vite setup:

```ts
// vite.config.ts
import { defineConfig } from "vite";
// ...

export default defineConfig({
    // ...
    build: {
        outDir: "../App_Plugins/my-package/dist", // all compiled files will be placed here
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            external: [/^@umbraco/], // ignore the Umbraco Backoffice package in the build
        },
    },
    base: "/App_Plugins/my-package/", // the base path of the app in the browser (used for assets)
});
```

## Quickstart

Create a Vue file in your `src` folder with `.ce.vue` extension, e.g. `dashboard.ce.vue`. Add the following content:

```vue
<script lang="ts" setup>
import { UMB_CURRENT_USER_CONTEXT } from "@umbraco-cms/backoffice/current-user";

defineManifest({
  type: 'dashboard',
  alias: "My.Dashboard.MyExtension",
  name: "My Dashboard",
  meta: {
    label: "My Dashboard",
    pathname: "my-dashboard"
  }
})

const { currentUser } = useContext(UMB_CURRENT_USER_CONTEXT)

const fullName = computed(() => currentUser.value.name)

const email = computed(() => currentUser.value.email)
</script>

<template>
<section>
  <h1>Hello, {{ fullName }}</h1>
  <p>Your email is {{ email }}</p>
</section>
</template>
```

That's it! The file should get picked up and bundled into Umbraco extension. Now, you should be able to see your Vue component inside an extra "My Dashboard" tab in Umbraco Backoffice.

## License

[MIT](./LICENSE) License © 2025-PRESENT [JoJk0](https://github.com/jojk0)
