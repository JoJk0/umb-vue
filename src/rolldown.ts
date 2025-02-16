/**
 * This entry file is for Rolldown plugin.
 *
 * @module
 */

import { UmbVue } from './core/index'

/**
 * Rolldown plugin
 *
 * ```ts
 * // rolldown.config.js
 * import UmbVue from 'umb-vue/rolldown'
 *
 * export default {
 *   plugins: [UmbVue()],
 * }
 * ```
 */
const rolldown = UmbVue.rolldown as typeof UmbVue.rolldown
export default rolldown
export { rolldown as 'module.exports' }
