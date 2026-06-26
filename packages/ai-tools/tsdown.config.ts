import { defineConfig } from 'tsdown'

export default defineConfig({
  format: ['cjs', 'esm'],
  exports: true,
  dts: {
    sourcemap: true,
  },
  publint: true,
  attw: true,
  minify: true,
})
