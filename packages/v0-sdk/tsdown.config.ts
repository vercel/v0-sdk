import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/browser.ts'],
  format: ['cjs', 'esm'],
  exports: true,
  dts: {
    sourcemap: true,
  },
  publint: true,
  attw: true,
  minify: true,
})
