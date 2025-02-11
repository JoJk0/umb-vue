import {
  UmbElementMixin,
  type UmbElement,
} from '@umbraco-cms/backoffice/element-api'
import { customElement } from '@umbraco-cms/backoffice/external/lit'
import { extend, isPlainObject } from '@vue/shared'
import umbVueCssUrls from '#global-styles'
import {
  defineComponent,
  getCurrentInstance,
  h,
  Suspense,
  VueElement,
  type ComponentObjectPropsOptions,
  type ComponentOptions,
  type ComponentPublicInstance,
  type CreateAppFunction,
  type CustomElementOptions,
  type DefineComponent,
  type RenderFunction,
  type SetupContext,
  type VueElementConstructor,
} from 'vue'
import { consumeContext, elObservablesToRefs, getAllMethods } from './utils'
import type {
  UmbClassInterface,
  UmbContext,
} from '@umbraco-cms/backoffice/class-api'
import type { UmbContextToken } from '@umbraco-cms/backoffice/context-api'
import type { HTMLElementConstructor } from '@umbraco-cms/backoffice/extension-api'
import type { umbExtensionsRegistry } from '@umbraco-cms/backoffice/extension-registry'

export { useObservable } from '@vueuse/rxjs'

/**
 * Vue `<script setup>` compiler macro for declaring a component's Umbraco extension manifest.
 * @param options - Umbraco Manifest options
 */
export function defineManifest(
  options: Parameters<typeof umbExtensionsRegistry.register>[0] & {
    /**
     * List of aliases to overwrite by this extension
     */
    overwrites?: string[]
    /**
     * Since UmbVue handles the registration of the component, this should always be undefined
     */
    element?: undefined
  },
): Parameters<typeof umbExtensionsRegistry.register>[0] {
  return options
}

// overload 1: direct setup function
export function defineUmbVueElement<Props, RawBindings = object>(
  setup: (props: Props, ctx: SetupContext) => RawBindings | RenderFunction,
  options?: Pick<ComponentOptions, 'name' | 'inheritAttrs' | 'emits'> &
    CustomElementOptions & {
      props?: (keyof Props)[]
    } & { elementName: string },
): VueElementConstructor<Props> & HTMLElementConstructor<UmbElement>

export function defineUmbVueElement<Props, RawBindings = object>(
  setup: (props: Props, ctx: SetupContext) => RawBindings | RenderFunction,
  options?: Pick<ComponentOptions, 'name' | 'inheritAttrs' | 'emits'> &
    CustomElementOptions & {
      props?: ComponentObjectPropsOptions<Props>
    } & { elementName: string },
): VueElementConstructor<Props> & HTMLElementConstructor<UmbElement>

// overload 3: defining a custom element from the returned value of
// `defineComponent`
export function defineUmbVueElement<
  // this should be `ComponentPublicInstanceConstructor` but that type is not exported
  T extends { new (...args: any[]): ComponentPublicInstance<any> },
>(
  options: T,
  extraOptions?: CustomElementOptions & { elementName: string },
): VueElementConstructor<
  T extends DefineComponent<infer P, any, any, any> ? P : unknown
> &
  HTMLElementConstructor<UmbElement>

/**
 * Defines a Vue Custom Element with Umbraco context consumers.
 */
export function defineUmbVueElement(
  options: any,
  extraOptions?: ComponentOptions,
  /**
   * @internal
   */
  _createApp?: CreateAppFunction<Element>,
): HTMLElementConstructor<UmbElement> & VueElementConstructor {
  const isAsyncSetup = options.setup?.toString().startsWith('async')

  // const sweetenedProps = Object.entries(options.props ?? {}).reduce((acc, [propName, propType]) => {
  //   const sugar = {
  //     'value': 'value',
  //     'onUpdate:value': 'property-value-change',
  //   }

  //   return {
  //     ...acc,
  //   }
  // }, {})

  const Comp = defineComponent(
    isAsyncSetup
      ? {
          ...options,
          setup: undefined,
          render() {
            return h(
              Suspense,
              {},
              {
                default: () =>
                  h(options, {
                    ...(this as any).$attrs,
                    ...(this as any).$props,
                  }),
              },
            )
          },
        }
      : options,
    extraOptions,
  )

  if (isPlainObject(Comp)) extend(Comp, extraOptions)

  // TODO: Support for decorators (wip on Tsdown/Oxc/SWC)
  // @customElement(extraOptions?.elementName)
  class UmbVueCustomElement extends UmbElementMixin(VueElement) {
    static def = Comp
    constructor(initialProps?: Record<string, any>) {
      super(Comp as any, initialProps, _createApp)

      options.emits?.forEach((emit: string) => {
        if (emit.startsWith('update:')) {
          this.addEventListener(emit, (e) => {
            ;(this as Record<string, any>)[emit.replace('update:', '')] = (
              e as CustomEvent
            ).detail[0]
            this.dispatchEvent(new CustomEvent('property-value-change'))
          })
        }
      })

      umbVueCssUrls.forEach((url) => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = url
        this.shadowRoot?.prepend(link)
      })

      this.setAttribute(
        'class',
        [this.getAttribute('class') ?? '', UMB_VUE_ELEMENT_CLASS].join(' '),
      )
    }
  }

  // TOOD: Remove this in favour of decorators once supported by builder
  customElement(extraOptions?.elementName)(UmbVueCustomElement)

  return UmbVueCustomElement
}

/**
 * Use an Umbraco repository in a Vue component.
 * @param Repository - The repository class to use
 * @returns The repository instance
 */
export function useRepository<TRepository extends new (...args: any[]) => any>(
  Repository: TRepository,
) {
  const hostEl = useHostElement() as Record<string, any> | null

  if (!hostEl)
    throw new Error(
      '[umb-vue]: `useRepository` must be called within a Vue Custom Element',
    )

  if (!hostEl[Repository.toString()])
    hostEl[Repository.toString()] = new Repository(hostEl)

  const prototypeProperties = getAllMethods(hostEl[Repository.toString()])

  return prototypeProperties as TRepository extends new (
    ...args: any[]
  ) => infer T
    ? T
    : never
}

/**
 * Consume an Umbraco context in a Vue component.
 * @param CONTEXT_TOKEN - The context token
 * @param host - The host element *(mandatory if calling within async function)*
 * @returns The context value with reactive properties
 */
export async function useContext<T extends UmbContext>(
  CONTEXT_TOKEN: UmbContextToken<T>,
  host?: UmbClassInterface & UmbElement,
): Promise<
  {
    controllerAlias?: import('@umbraco-cms/backoffice/controller-api').UmbControllerAlias
    hostConnected?: (() => void) | undefined
    hostDisconnected?: (() => void) | undefined
    destroy?: (() => void) | undefined
  } & {
    [key in keyof T]: T[key] extends import('@umbraco-cms/backoffice/observable-api').Observable<
      infer U
    >
      ? Readonly<import('vue').Ref<U, U>>
      : T[key]
  }
> {
  // Host element is mandatory if calling from an async function
  // https://4ark.me/post/87ba8d8b.html/
  const hostEl = (host ?? useHostElement()) as UmbClassInterface &
    UmbElement & {
      [k in typeof CONTEXT_TOKEN.contextAlias]?: T
    }

  if (!hostEl)
    throw new Error(
      '[umb-vue]: `useContext` must be called within a Vue Custom Element. If you are calling it within a async function, pass the host element as the second argument.',
    )

  if (!hostEl[CONTEXT_TOKEN.contextAlias])
    hostEl[CONTEXT_TOKEN.contextAlias] = await consumeContext(
      hostEl as UmbClassInterface & UmbElement,
      CONTEXT_TOKEN,
    )

  const prototypeProperties = getAllMethods(hostEl[CONTEXT_TOKEN.contextAlias]!)

  const reactiveProperties = elObservablesToRefs(
    hostEl[CONTEXT_TOKEN.contextAlias]!,
  )

  return {
    ...hostEl[CONTEXT_TOKEN.contextAlias],
    ...(prototypeProperties as Record<string, never>),
    ...reactiveProperties,
  }
}

/**
 * Get the host element of the current Umbraco Vue component.
 * @returns The host element
 */
export function useHostElement<
  T extends UmbClassInterface & UmbElement = UmbClassInterface & UmbElement,
>(): T {
  const instance = getCurrentInstance() as { ce?: T; parent?: { ce?: T } }

  if (instance?.ce) return instance.ce
  else if (instance?.parent?.ce) return instance.parent.ce
  else
    throw new Error(
      '[umb-vue]: `useHostElement` must be called within a Umbraco Vue Custom Element',
    )
}
