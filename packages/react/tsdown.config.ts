import { defineConfig } from 'tsdown'

const shared = {
  format: ['cjs', 'esm'] as const,
  exports: true,
  dts: {
    sourcemap: true,
  },
  minify: true,
}

export default defineConfig([
  {
    ...shared,
    name: 'root',
    entry: { index: 'src/index.ts' },
    clean: true,
    publint: false,
    attw: false,
  },
  {
    ...shared,
    name: 'swr',
    entry: { swr: 'src/swr.ts' },
    clean: false,
    publint: true,
    attw: true,
  },
])
