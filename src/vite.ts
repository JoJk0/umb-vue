/**
 * This entry file is for Vite plugin.
 *
 * @module
 */

import { UmbVue } from './core/index'

/**
 * Vite plugin
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import UmbVue from 'umb-vue/vite'
 *
 * export default defineConfig({
 *   plugins: [UmbVue()],
 * })
 * ```
 */
const vite = UmbVue.vite as typeof UmbVue.vite
export default vite
export { vite as 'module.exports' }
