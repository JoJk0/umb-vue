<p align="center"><img src="./docs/public/logo.svg" alt="umb-vue" style="width: 10em; display: block; margin: 3em auto;" /></p>

<h1 align="center"><code>umb-vue</code></h1>
<p align="center">Vue.js integrations for <a href="https://docs.umbraco.com/umbraco-cms">Umbraco CMS</a> 14+ Backoffice.</p>
<p align="center">
  <a href="https://jojk0.github.io/umb-vue/">Docs</a> • <a href="https://jojk0.github.io/umb-vue/">Examples</a>
</p>
<p align="center">
  <a href="https://npmjs.com/package/umb-vue"><img src="https://img.shields.io/npm/v/umb-vue.svg" alt="npm" /></a>
  <a href="https://github.com/jojk0/umb-vue/actions/workflows/unit-test.yml"><img src="https://github.com/sxzz/unplugin-starter/actions/workflows/unit-test.yml/badge.svg" alt="Unit test" /></a>
</p>

## 🚧 WIP 🚧

**This package is in active development and is not ready for any use at the moment.**

## Features

- 🧩 **Umbraco Vue Element** - Vue SFC custom element as Umbraco Extensions

- 🔗 **Umbraco Vue composables** - Access Umbraco Backoffice APIs via Vue composables

- 🤖 **Extension auto-registration and bundling** - Define manifests inside Vue files

## Background

As [Umbraco 14 has been shipped](https://umbraco.com/blog/umbraco-14-release/), their Backoffice has been completely rewritten to use custom elements with [Lit](https://lit.dev/). This enables to use any framework of choice inside Umbraco Backoffice, allowing endless possibilities for integrations. Through [Extension Manifests](https://docs.umbraco.com/umbraco-cms/customizing/extending-overview/extension-registry/extension-manifest), any functionality inside the Backoffice can be extended, or new features created altogether. Due to Vue's excellent performance and [ease of use as Custom Elements](https://vuejs.org/guide/extras/web-components), its components can be seamlessly integrated into Umbraco Backoffice. This package removes the need to handle with Lit Elements and allows to use Umbraco integrations directly inside Vue files.
## Installation

Install the package with your chosen package manager:

```bash
pnpm i -D umb-vue
```

It can be used with most of common builders:

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

## Umbraco setup

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

## Configuration

## API

### `defineUmbVueElement`

`v-model` sugar of property editor UIs - `value` and auto-dispatch `property-value-change`

### `defineManifest`

Vue SFC macro for auto-registration of elements - takes filename as element name by default + prefix; Configure builder as a library with auto-imported extensions

### `useContext`

composable to access Umbraco Contexts (including custom ones). `Observable`s are `computed` properties, auto-observing

### `useRepository`

Use an Umbraco repository in a Vue component.

### `useHostElement`

Get the host element of the current Umbraco Vue component.

### `useObservable`

Observe the observable and return reactive binding. Re-exported from [`@vueuse/rxjs`](https://vueuse.org/rxjs/useObservable/)

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

const { currentUser } = await useContext(UMB_CURRENT_USER_CONTEXT)

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
