import { Observable } from '@umbraco-cms/backoffice/external/rxjs'
import { useObservable } from '@vueuse/rxjs'
import type {
  UmbClassInterface,
  UmbContext,
} from '@umbraco-cms/backoffice/class-api'
import type { UmbContextToken } from '@umbraco-cms/backoffice/context-api'
import type { Ref } from 'vue'

export function consumeContext<TContext extends UmbContext>(
  hostElement: UmbClassInterface,
  contextToken: UmbContextToken<TContext, TContext>,
): Promise<TContext> {
  return new Promise<TContext>((resolve) => {
    const timeout = 5000
    const timer = setTimeout(() => {
      console.warn(
        `[umb-vue]: Context ${contextToken.toString()} not provided within ${timeout}ms in`,
        hostElement,
      )
    }, timeout)

    hostElement.consumeContext(contextToken, (instance) => {
      clearTimeout(timer)
      resolve(instance)
    })
  })
}

/**
 * Convert pascal case to kebab case
 * @example pascalToKebabCase('MyComponent') // 'my-component'
 */
export function pascalToKebabCase(str?: string): string | undefined {
  return str?.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * Convert kebab case to pascal case
 * @example kebabToPascalCase('my-component') // 'MyComponent'
 */
export const kebabToPascalCase = (str: string): string =>
  str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')

export const toCamelCase = (str: string): string =>
  str
    .split('')
    .map((word, index) => (index === 0 ? word.toLowerCase() : word))
    .join('')

export function getAllMethods<T extends Record<string, any>>(instance: T) {
  let methods: Record<string, any> = {}

  const collect = (subInstance: any) => {
    const prototype = Object.getPrototypeOf(subInstance)
    const prototypePropertyNames = Object.getOwnPropertyNames(prototype).filter(
      (name) => name !== 'constructor',
    )

    const entries = prototypePropertyNames.map((name) => [
      name,
      (...args: any[]) => instance[name](...args),
    ])

    methods = { ...methods, ...Object.fromEntries(entries) }

    if (Object.getPrototypeOf(prototype)) collect(prototype)
  }

  collect(instance)

  return methods as T
}
/**
 * Convert observables to refs
 * @param el - Object with observables
 * @returns Object with refs created from observables
 */
export function elObservablesToRefs<T extends Record<string, any>>(
  el: T,
): {
  [key in keyof T]: T[key] extends Observable<infer U>
    ? Readonly<Ref<U, U>>
    : T[key]
} {
  return Object.entries(el).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: value instanceof Observable ? useObservable(value) : value,
    }),
    {} as {
      [key in keyof T]: T[key] extends Observable<infer U>
        ? Readonly<Ref<U>>
        : T[key]
    },
  )
}
