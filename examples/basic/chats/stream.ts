import { createV0Client, readV0Stream } from 'v0'

const baseUrl = process.env.V0_BASE_URL ?? 'https://v0.app'
const isLocal = baseUrl.includes('localhost')

const v0 = createV0Client({
  auth: (isLocal ? process.env.V0_API_KEY_LOCAL : process.env.V0_API_KEY)!,
  baseUrl,
})

const serverResult = await v0.chats.createStream({
  message: 'Simple hello world button',
})

const result = readV0Stream(serverResult.toResponse())

let updateCount = 0

for await (const update of result.stream) {
  updateCount++
  console.log(update)
}

const final = await result.final
console.log(`Received ${updateCount} stream updates`)
console.log('Final result:', final)
