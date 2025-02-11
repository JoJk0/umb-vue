import { glob, readFile } from 'node:fs/promises'
import { basename } from 'node:path'
import { createFilter } from '@rollup/pluginutils'
import { MagicStringAST } from '@vue-macros/common'
import { createUnplugin, type UnpluginInstance } from 'unplugin'
import { kebabToPascalCase, toCamelCase } from '../lib/utils'
import { transformDefineManifest } from './define-manifest'
import { resolveOptions, type Options } from './options'

export const Starter: UnpluginInstance<Options | undefined, false> =
  createUnplugin((rawOptions = {}) => {
    const options = resolveOptions(rawOptions)

    const filter = createFilter(options.include, options.exclude)

    const name = 'umb-vue'

    const libEntry = './__lib.ts'

    return {
      name,
      enforce: options.enforce,
      resolveId(id) {
        if (id.includes('#global-styles')) return `\0${id}`
        if (id.includes('__lib.ts')) return `\0${id}`
      },
      async load(id) {
        if (id === '\0#global-styles') {
          const cssUrlsImports = options.css
            ?.map(
              (module, index) =>
                `import cssModule${index} from '${module}?url'`,
            )
            .join('\n')

          const cssUrlsExport = `export default [${options.css?.map((_, index) => `cssModule${index}`)?.join(', ')}]`
          return {
            code: [cssUrlsImports, cssUrlsExport].join('\n\n'),
          }
        }

        if (id.endsWith('__lib.ts')) {
          const filesGlob = options.include

          const filesPromises = glob(filesGlob)

          const files: string[] = []

          for await (const file of filesPromises) {
            if (/^defineManifest/m.test(await readFile(file, 'utf-8')))
              files.push(file)
          }

          const makeComponentName = (filename: string) =>
            kebabToPascalCase(basename(filename, '.ce.vue'))

          const makeCustomExport = (name: string) => `export * from '/${name}'` // TODO: path resolution

          const makeImport = (filename: string) =>
            `import ${makeComponentName(filename)} from '/${filename.replaceAll('\\', '/')}'`

          const makeExport = (
            filename: string,
          ) => `export const ${toCamelCase(makeComponentName(filename))}Manifest = {
              ...${makeComponentName(filename)}.manifest,
              element: defineUmbVueElement(${makeComponentName(filename)}, { elementName: '${options.elementPrefix ? `${options.elementPrefix}-` : ''}${basename(filename, '.ce.vue')}' }),
          }`

          const umbVueImport = "import { defineUmbVueElement } from 'umb-vue'"

          const imports = files.map(makeImport).join('\n')

          const exports = files.map(makeExport).join('\n')

          const customExports = options.entries
            ?.map(makeCustomExport)
            .join('\n')

          const newSrc = [umbVueImport, imports, exports, customExports].join(
            '\n\n',
          )

          const ast = new MagicStringAST(newSrc)

          return {
            code: newSrc,
            map: ast.generateMap(),
          }
        }
      },

      transformInclude(id) {
        return filter(id)
      },

      transform(_, id) {
        if (options.defineManifest) {
          return transformDefineManifest(_, id)
        }
      },

      vite: {
        config: {
          handler: () => ({
            build: {
              lib: {
                entry: {
                  index: libEntry,
                },
                formats: ['es'],
              },
              sourcemap: true,
              rollupOptions: {
                external: [/^@umbraco/],
              },
            },
            define: {
              UMB_VUE_ELEMENT_PREFIX: JSON.stringify(
                options.elementPrefix ?? 'umb-vue',
              ),
              UMB_VUE_ELEMENT_CLASS: JSON.stringify(options.elementClass),
            },
          }),
        },
      },
      rollup: {
        options: {
          handler: () => ({
            input: {
              index: libEntry,
            },
            output: {
              format: 'es',
              sourcemap: true,
            },
            external: [/^@umbraco/],
            // TODO: Env vars UMB_VUE_ELEMENT_PREFIX and UMB_VUE_ELEMENT_CLASS
          }),
        },
      },
      rolldown: {
        outputOptions: {
          handler: () => ({
            format: 'es',
            sourcemap: true,
          }),
        },
        options: {
          handler: () => ({
            input: {
              index: libEntry,
            },
            define: {
              UMB_VUE_ELEMENT_PREFIX: JSON.stringify(
                options.elementPrefix ?? 'umb-vue',
              ),
              UMB_VUE_ELEMENT_CLASS: JSON.stringify(options.elementClass),
            },
            external: [/^@umbraco/],
          }),
        },
      },
      esbuild: {
        config: (esb) => {
          esb.define = {
            UMB_VUE_ELEMENT_PREFIX: JSON.stringify(
              options.elementPrefix ?? 'umb-vue',
            ),
            UMB_VUE_ELEMENT_CLASS: JSON.stringify(options.elementClass),
          }
          esb.entryPoints = {
            index: libEntry,
          }
          esb.sourcemap = true
          esb.external = ['@umbraco*']
          esb.format = 'esm'
        },
      },
    }
  })
