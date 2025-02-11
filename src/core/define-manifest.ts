import {
  addNormalScript,
  checkInvalidScopeReference,
  createFilter,
  generateTransform,
  importHelperFn,
  MagicStringAST,
  parseSFC,
  type BaseOptions,
  type CodeTransform,
} from '@vue-macros/common'
import { createUnplugin, type UnpluginInstance } from 'unplugin'
import {
  checkDefaultExport,
  filterManifestMacro,
  getRootScopeIds,
  resolveOptions,
} from './utils'

import type { ObjectExpression } from '@babel/types'

const DEFINE_MANIFEST = 'defineManifest'

export const defineManifestPlugin: UnpluginInstance<
  BaseOptions | undefined,
  false
> = createUnplugin((userOptions = {}, { framework }) => {
  const options = resolveOptions(userOptions, framework)
  const filter = createFilter(options)

  return {
    name: 'umb-vue-define-manifest',
    enforce: 'pre',
    transformInclude: filter,
    transform: transformDefineManifest,
  }
})

export function hasPropsOrEmits(node: ObjectExpression): boolean {
  return node.properties.some(
    (prop) =>
      (prop.type === 'ObjectProperty' || prop.type === 'ObjectMethod') &&
      prop.key.type === 'Identifier' &&
      (prop.key.name === 'props' ||
        prop.key.name === 'emits' ||
        prop.key.name === 'expose' ||
        prop.key.name === 'slots'),
  )
}

export function transformDefineManifest(
  code: string,
  id: string,
): CodeTransform | undefined {
  if (!code.includes(DEFINE_MANIFEST)) return

  const sfc = parseSFC(code, id)
  if (!sfc.scriptSetup) return
  const { scriptSetup, getSetupAst, getScriptAst } = sfc
  const setupOffset = scriptSetup.loc.start.offset
  const setupAst = getSetupAst()!

  const nodes = filterManifestMacro(setupAst!.body, DEFINE_MANIFEST)
  if (nodes.length === 0) return
  else if (nodes.length > 1)
    throw new SyntaxError(`duplicate ${DEFINE_MANIFEST}() call`)

  const scriptAst = getScriptAst()!
  if (scriptAst) checkDefaultExport(scriptAst.body, DEFINE_MANIFEST)

  const setupBindings = getRootScopeIds(setupAst)

  const s = new MagicStringAST(code)

  const [node] = nodes
  const [arg] = node.arguments

  if (arg) {
    const normalScript = addNormalScript(sfc, s)

    const scriptOffset = normalScript.start()

    s.appendLeft(
      scriptOffset,
      `\nexport default /*#__PURE__*/ ${importHelperFn(
        s,
        scriptOffset,
        'defineComponent',
      )}({\nmanifest: `,
    )

    if (arg.type === 'ObjectExpression' && hasPropsOrEmits(arg)) {
      throw new SyntaxError(
        `${DEFINE_MANIFEST}() please use defineProps, defineEmits, defineExpose, or defineSlots instead.`,
      )
    }

    checkInvalidScopeReference(arg, DEFINE_MANIFEST, setupBindings)

    s.moveNode(arg, scriptOffset, { offset: setupOffset })

    // removes defineManifest()
    s.remove(setupOffset + node.start!, setupOffset + arg.start!)
    s.remove(setupOffset + arg.end!, setupOffset + node.end!)

    s.appendRight(scriptOffset, '\n});')
    normalScript.end()
  } else {
    // removes defineManifest()
    s.removeNode(node, { offset: setupOffset })
  }

  const m = generateTransform(s, id)

  return m
}
