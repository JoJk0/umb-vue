<script lang="ts" setup>
import { UMB_CURRENT_USER_CONTEXT } from '@umbraco-cms/backoffice/current-user'

defineManifest({
  type: 'dashboard',
  alias: 'My.Dashboard.MyExtension',
  name: 'My Dashboard',
  meta: {
    label: 'My Dashboard',
    pathname: 'my-dashboard',
  },
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
