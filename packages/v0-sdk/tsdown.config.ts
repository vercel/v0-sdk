import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'ai-sdk': 'src/ai-sdk/index.ts',
    react: 'src/react/index.ts',
  },
  format: ['cjs', 'esm'],
  exports: true,
  dts: {
    sourcemap: true,
  },
  publint: true,
  attw: true,
  minify: true,
})
