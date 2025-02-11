import type { PluginOptions } from './vite'

declare global {
  const UMB_VUE_ELEMENT_PREFIX: NonNullable<PluginOptions['elementPrefix']>

  const UMB_VUE_ELEMENT_CLASS: NonNullable<PluginOptions['elementClass']>
}
