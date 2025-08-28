const fs = require('fs')
const path = require('path')

// Find all test files that need updating
const testFiles = [
  'tests/chats/create-message.test.ts',
  'tests/chats/create.test.ts',
  'tests/chats/delete.test.ts',
  'tests/chats/favorite.test.ts',
  'tests/chats/find-messages.test.ts',
  'tests/chats/find-versions.test.ts',
  'tests/chats/find.test.ts',
  'tests/chats/get-message.test.ts',
  'tests/chats/get-version.test.ts',
  'tests/chats/getById.test.ts',
  'tests/chats/init.test.ts',
  'tests/chats/update-version.test.ts',
  'tests/deployments/find-errors.test.ts',
  'tests/deployments/findLogs.test.ts',
  'tests/hooks/create.test.ts',
  'tests/hooks/delete.test.ts',
  'tests/hooks/find.test.ts',
  'tests/hooks/get-by-id.test.ts',
  'tests/hooks/update.test.ts',
  'tests/projects/create.test.ts',
  'tests/projects/find.test.ts',
  'tests/projects/get-by-chat-id.test.ts',
  'tests/projects/update.test.ts',
  'tests/user/get-billing.test.ts',
  'tests/user/get-scopes.test.ts',
  'tests/user/get.test.ts',
  'tests/user/getPlan.test.ts',
  'tests/rateLimits/find.test.ts',
  'tests/integrations/vercel/projects/create.test.ts',
  'tests/integrations/vercel/projects/find.test.ts',
]

testFiles.forEach((filePath) => {
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${filePath} - file not found`)
    return
  }

  const content = fs.readFileSync(filePath, 'utf8')

  // Add createStreamingFetcher to mock if it doesn't exist
  if (
    !content.includes('createStreamingFetcher') &&
    content.includes('createFetcher: vi.fn')
  ) {
    const updatedContent = content.replace(
      /(createFetcher: vi\.fn[^,]*),/g,
      '$1,\n  createStreamingFetcher: vi.fn(),',
    )

    if (updatedContent !== content) {
      fs.writeFileSync(filePath, updatedContent)
      console.log(`Updated ${filePath}`)
    }
  }
})

console.log('Mock updates completed')
