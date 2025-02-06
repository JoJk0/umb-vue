type ImportNameAlias = [string, string]
type ImportsMap = Record<string, (string | ImportNameAlias)[]>

export const imports: ImportsMap = {
  'umb-vue': [
    'defineManifest',
    'defineUmbVueElement',
    'useContext',
    'useHostElement',
    'useUmbRequest',
    'useRepository',
    'useObservable',
  ] as const,
}

// eslint-disable-next-line import/no-default-export
export default imports
