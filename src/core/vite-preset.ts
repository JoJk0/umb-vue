import { glob, readFile } from 'node:fs/promises'
import { basename } from 'node:path'
import type { Plugin } from 'vite'
import { MagicStringAST } from '@vue-macros/common'
import { kebabToPascalCase, toCamelCase } from './utils'

export function autoImportPreset() { }

export interface PluginOptions {
  /**
   * Files or directories to scan for custom elements
   * @default ['./src/**\/*.ce.vue']
   */
  include?: string[]
  /**
   * Additional manifest entries to be bundled in `index.js` file.
   */
  entries?: string[]
  /**
   * The output directory of the library.
   * Usually `../<umbraco-project>/App_Plugins/<plugin-name>/dist`.
   */
  outDir: string
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
}

/**
 * Vite plugin for building Umbraco Vue web components.
 * @param options - The plugin options.
 * @returns The Vite plugin.
 */
export function UmbVue(options: PluginOptions) {
  return {
    name: 'umb-vue',
    enforce: 'pre',
    async transform(_, id) {
      if (id.includes('admin/umb-vue/__global-styles.ts')) {
        const cssUrlsImports = options.css?.map((module, index) => `import cssModule${index} from '${module}?url'`).join('\n')

        const cssUrlsExport = `export default [${options.css?.map((_, index) => `cssModule${index}`)?.join(', ')}]`

        return {
          code: [cssUrlsImports, cssUrlsExport].join('\n\n'),
          map: null,
        }
      }
      if (id.includes('admin/umb-vue/__lib.ts')) {
        const filesGlob = options.include ?? ['./src/**/*.ce.vue']

        const filesPromises = glob(filesGlob)

        const files: string[] = []

        for await (const file of filesPromises) {
          if (/^defineManifest/m.test(await readFile(file, 'utf-8')))
            files.push(file)
        }

        const makeComponentName = (filename: string) => kebabToPascalCase(basename(filename, '.ce.vue'))

        const makeCustomExport = (name: string) => `export * from '../../${name}'` // TODO: path resolution

        const makeImport = (filename: string) => `import ${makeComponentName(filename)} from '../../${filename.replace(/\\/g, '/')}'`

        const makeExport = (filename: string) => `export const ${toCamelCase(makeComponentName(filename))}Manifest = {
            ...${makeComponentName(filename)}.manifest,
            element: defineUmbVueElement(${makeComponentName(filename)}, { elementName: '${options.elementPrefix ? `${options.elementPrefix}-` : ''}${basename(filename, '.ce.vue')}' }),
        }`

        const imports = files.map(makeImport).join('\n')

        const exports = files.map(makeExport).join('\n')

        const customExports = options.entries?.map(makeCustomExport).join('\n')

        const newSrc = [imports, exports, customExports].join('\n\n')

        const ast = new MagicStringAST(newSrc)

        return {
          code: newSrc,
          map: ast.generateMap(),
        }
      }
    },
    config() {
      return {
        build: {
          lib: {
            entry: {
              index: './admin/umb-vue/__lib',
            },
            formats: ['es'],
          },
          outDir: options.outDir, // your web component will be saved in this location
          sourcemap: true,
          rollupOptions: {
            external: [/^@umbraco/],
          },
        },
        define: {
          UMB_VUE_ELEMENT_PREFIX: JSON.stringify(options.elementPrefix ?? 'umb-vue'),
          UMB_VUE_ELEMENT_CLASS: JSON.stringify(options.elementClass),
        },
      }
    },
  } satisfies Plugin
}

export default UmbVue
