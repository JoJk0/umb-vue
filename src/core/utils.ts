import {
  detectVueVersion,
  FilterFileType,
  getFilterPattern,
  isCallOf,
  type BaseOptions,
  type MarkRequired,
} from '@vue-macros/common'

import { walkAST } from 'ast-walker-scope'

import type {
  CallExpression,
  ExportDefaultDeclaration,
  Node,
  Program,
  Statement,
  VariableDeclaration,
} from '@babel/types'

import type { UnpluginContextMeta } from 'unplugin'

export function filterManifestMacro(
  stmts: Statement[],
  test: string,
): CallExpression[] {
  return stmts
    .map((raw: Node) => {
      let node = raw
      if (raw.type === 'ExpressionStatement') node = raw.expression
      return isCallOf(node, test) ? node : undefined
    })
    .filter((node): node is CallExpression => !!node)
}

export function filterMacro(
  stmts: Statement[],
  literal: string,
): VariableDeclaration[] {
  return stmts.filter((node): node is VariableDeclaration => {
    const isVar = node.type === 'VariableDeclaration'
    if (isVar) {
      const decl = node.declarations[0]
      if (decl.init && isCallOf(decl.init, literal)) return true
    }
    return false
  })
}

export function extractContextData(nodes: VariableDeclaration[]): {
  keys: any
  contextToken: any
}[] {
  return nodes.map((node) => {
    const { id, init } = node.declarations[0]

    const keys =
      id.type === 'ObjectPattern'
        ? id.properties.map((prop) => {
            if (
              prop.type === 'ObjectProperty' &&
              prop.key.type === 'Identifier'
            )
              return prop.key.name
            return '*'
          })
        : ['*']

    const contextTokenArg = (init as CallExpression)!.arguments[0]

    if (contextTokenArg.type !== 'Identifier')
      throw new Error('Context token must be an identifier')

    return {
      keys: keys.includes('*') ? ('*' as const) : keys,
      contextToken: contextTokenArg.name,
    }
  })
}

export function extractRepositoryData(nodes: VariableDeclaration[]): any[] {
  return nodes.map((node) => {
    const { init } = node.declarations[0]

    const repositoryArg = (init as CallExpression)!.arguments[0]

    if (repositoryArg.type !== 'Identifier')
      throw new Error('Context token must be an identifier')

    return repositoryArg.name
  })
}

export function resolveOptions<TOptions extends BaseOptions>(
  options: TOptions,
  framework: UnpluginContextMeta['framework'],
): MarkRequired<TOptions, 'include' | 'version'> {
  const version = options.version || detectVueVersion()
  const include = getFilterPattern(
    [FilterFileType.VUE_SFC_WITH_SETUP, FilterFileType.SETUP_SFC],
    framework,
  )
  return {
    include,
    ...options,
    version,
  }
}

export function checkDefaultExport(stmts: Statement[], key: string): void {
  const hasDefaultExport = stmts.some(
    (node): node is ExportDefaultDeclaration =>
      node.type === 'ExportDefaultDeclaration',
  )
  if (hasDefaultExport) {
    throw new SyntaxError(
      `${key} cannot be used with default export within <script>.`,
    )
  }
}

export function getRootScopeIds(program: Program): string[] {
  let ids: string[] = []
  walkAST(program, {
    enter(node) {
      if (node.type === 'BlockStatement') this.skip()
    },
    leave(node) {
      if (node.type !== 'Program') return
      ids = Object.keys(this.scope)
    },
  })

  return ids
}
