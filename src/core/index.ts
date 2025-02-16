import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { glob, readFile } from 'node:fs/promises'
import { basename } from 'node:path'
import { createFilter } from '@rollup/pluginutils'
import { MagicStringAST } from '@vue-macros/common'
import { createUnplugin, type UnpluginInstance } from 'unplugin'
import { kebabToPascalCase, toCamelCase } from '../lib/utils'
import { transformDefineManifest } from './define-manifest'
import { resolveOptions, type Options } from './options'
import type { BuildEnvironmentOptions } from 'vite'

export const UmbVue: UnpluginInstance<Options | undefined, false> =
  createUnplugin((rawOptions = {}) => {
    const options = resolveOptions(rawOptions)

    const filter = createFilter(options.include, options.exclude)

    const name = 'umb-vue'

    const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'))

    const getName = (name: string) => {
      const parts = name.split('-')
      return parts
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    }

    const umbracoPackage = {
      $schema: '../../umbraco-package-schema.json',
      name: packageJson.name,
      version: packageJson.version,
      extensions: [
        {
          type: 'bundle',
          alias: getName(packageJson.name).replaceAll(' ', '.'),
          name: `${getName(packageJson.name)} Bundle`,
          js: `/App_Plugins/${packageJson.name}/dist/index.js`,
        },
      ],
    }

    const builderConfig = {
      libEntry: './__lib.ts',
      format: 'es' as const,
      external: [/^@umbraco/],
      sourcemap: true,
      define: {
        UMB_VUE_ELEMENT_PREFIX: JSON.stringify(options.elementPrefix),
        UMB_VUE_ELEMENT_CLASS: JSON.stringify(options.elementClass)
      },
      baseUrl: options.umbracoDir
        ? `/App_Plugins/${packageJson.name}/dist/`
        : undefined,
      outDir: options.umbracoDir
        ? `${options.umbracoDir}/App_Plugins/${packageJson.name}/dist`
        : undefined,
    }

    if (options.umbracoDir) {
      const path = `${options.umbracoDir}/App_Plugins/${packageJson.name}`

      if (!existsSync(path)) mkdirSync(path, { recursive: true })

      writeFileSync(
        `${path}/umbraco-package.json`,
        JSON.stringify(umbracoPackage, null, 2),
      )
    }

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
          handler: () => {
            const {
              libEntry,
              format,
              sourcemap,
              external,
              baseUrl,
              outDir,
              define,
            } = builderConfig

            const build: BuildEnvironmentOptions = {
              lib: {
                entry: {
                  index: libEntry,
                },
                formats: [format],
              },
              sourcemap,
              rollupOptions: {
                external,
              },
            }

            if (options.umbracoDir) {
              return {
                base: baseUrl,
                build: {
                  ...build,
                  outDir,
                },
                define,
              }
            } else
              return {
                build,
                define,
              }
          },
        },
      },
      rollup: {
        options: {
          handler: () => {
            const {
              libEntry,
              format,
              sourcemap,
              external,
              baseUrl,
              outDir,
              define,
            } = builderConfig

            const input = {
              index: libEntry,
            }

            const output = {
              format,
              sourcemap,
              intro: Object.entries(define)
                .map(([key, value]) => `const ${key} = ${value};`)
                .join('\n'),
            }

            return options.umbracoDir
              ? {
                // TODO: BaseURL
                input,
                output: {
                  ...output,
                  dir: outDir,
                },
                external,
              }
              : {
                input,
                output,
                external,
              }
          },
        },
      },
      rolldown: {
        outputOptions: {
          handler: () => {
            const { format, sourcemap, baseUrl, outDir } = builderConfig

            return options.umbracoDir
              ? {
                dir: outDir,
                format,
                sourcemap,
              }
              : {
                format,
                sourcemap,
              }
          },
        },
        options: {
          handler: () => {
            const { libEntry, external, baseUrl, define } = builderConfig

            return {
              // TODO: BaseURL
              input: {
                index: libEntry,
              },
              define,
              external,
            }
          },
        },
      },
      esbuild: {
        config: (esb) => {
          const { libEntry, baseUrl, define, format, sourcemap, outDir } =
            builderConfig

          esb.define = define
          esb.entryPoints = {
            index: libEntry,
          }
          esb.sourcemap = sourcemap
          esb.external = ['@umbraco*']
          esb.format = `${format}m`
          esb.outdir = outDir
          // TODO: BaseURL
        },
      },
    }
  })
