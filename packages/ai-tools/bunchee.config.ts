import { defineBuildConfig } from 'bunchee'

export default defineBuildConfig({
  entries: ['src/index'],
  declaration: true,
  clean: true,
  format: ['esm', 'cjs'],
  target: 'es2022',
  external: ['ai', 'v0-sdk', 'zod'],
})
