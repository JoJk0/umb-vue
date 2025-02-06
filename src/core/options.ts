import type { FilterPattern } from '@rollup/pluginutils'

export interface Options {
  exclude?: FilterPattern
  /**
   * Files or directories to scan for custom elements
   * @default ['./src/**\/*.ce.vue']
   */
  include?: FilterPattern
  /**
   * Additional manifest entry imports to be bundled in `index.js` file.
   */
  entries?: string[]
  /**
   * Global CSS files/modules to be applied to web components inside the library.
   * @default []
   */
  css?: string[]
  /**
   * The prefix of the elements' name.
   * @default 'umb-vue'
   */
  elementPrefix?: string
  /**
   * The class name(s) applied to elements.
   * If enabled, extension components must only have a single root element, otherwise, warnings will be thrown.
   */
  elementClass?: string
  /**
   * Whether to use `defineManifest` Vue compiler macro
   * @default true
   */
  defineManifest?: boolean
  enforce?: 'pre' | 'post' | undefined
}

type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U

export type OptionsResolved = Overwrite<
  Required<Options>,
  Pick<Options, 'enforce'>
>

export function resolveOptions(options: Options): OptionsResolved {
  return {
    defineManifest: options.defineManifest ?? true,
    entries: options.entries ?? [],
    css: options.css || [],
    elementPrefix: options.elementPrefix || 'umb-vue',
    elementClass: options.elementClass ?? '',
    include: options.include || [/\.[cm]?[jt]sx?$/],
    exclude: options.exclude || [/node_modules/],
    enforce: 'enforce' in options ? options.enforce : 'pre',
  }
}
