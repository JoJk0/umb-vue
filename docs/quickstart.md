#  Quickstart

::: warning HEADS UP

🚧  Docs are currently under construction and may be missing key information 🚧

:::

Before you start, make sure you have [Umbraco set up correctly](./umbraco-setup).

`umb-vue` requires Node v22.13.1 or higher. You can install it from [nodejs.org](https://nodejs.org/).

Install the package with your preferred package manager:

::: code-group

```sh [npm]
npm install umb-vue
```

```sh [yarn]
yarn add umb-vue
```

```sh [pnpm]
pnpm add umb-vue
```

```sh [bun]
bun add umb-vue
```

:::

Add the plugin into your builder of choice:

::: code-group

```ts [vite.config.ts]
import UmbVue from 'umb-vue/vite'

export default defineConfig({
  plugins: [UmbVue({
    umbracoDir: 'path/to/umbraco'
  })],
})
```

```ts [rollup.config.js]
import UmbVue from 'umb-vue/rollup'

export default {
  plugins: [UmbVue()],
}
```

```ts [rolldown.config.js]
import UmbVue from 'umb-vue/rolldown'

export default {
  plugins: [UmbVue()],
}
```

```ts [esbuild.config.js]
import { build } from 'esbuild'
import UmbVue from 'umb-vue/esbuild'

build({
  plugins: [UmbVue()],
})
```

:::

If you specified `umbracoDir` in the plugin options, you do not need to set up base and output dirs as the plugin will handle it for you.

Create a Vue file in your `src` folder with `.ce.vue` extension, e.g. `dashboard.ce.vue`. Add the following content:

```vue [src/dashboard.ce.vue]
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
