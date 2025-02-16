/**
 * This entry file is for esbuild plugin. Requires esbuild >= 0.15
 *
 * @module
 */

import { UmbVue } from './core/index'

/**
 * Esbuild plugin
 * 
 * ```ts
 * import { build } from 'esbuild'
 * import UmbVue from 'umb-vue/esbuild'
 * 
 * build({ plugins: [UmbVue()] })
```
 */
const esbuild = UmbVue.esbuild as typeof UmbVue.esbuild
export default esbuild
export { esbuild as 'module.exports' }
