import { defineConfig } from 'bunchee'

export default defineConfig({
  entries: ['src/index.ts'],
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  dts: true,
})
