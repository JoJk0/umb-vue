/**
 * This entry file is for Rollup plugin.
 *
 * @module
 */

import { UmbVue } from './core/index'

/**
 * Rollup plugin
 * 
 * ```ts
 * // rollup.config.js
 * import UmbVue from 'umb-vue/rollup'
 *
 * export default {
 *   plugins: [UmbVue()],
 * }
 * ```
 */
const rollup = UmbVue.rollup as typeof UmbVue.rollup
export default rollup
export { rollup as 'module.exports' }
