import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: 'openapi.json',
  output: 'src/generated',
  plugins: [
    '@hey-api/typescript',
    {
      name: '@hey-api/transformers',
      dates: true,
    },
    {
      name: '@hey-api/sdk',
      transformer: true,
      paramsStructure: 'flat',
      operations: {
        containerName: 'V0Sdk',
        strategy: 'single',
      },
    },
  ],
})
