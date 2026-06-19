import { createV0Client } from 'v0'

const v0 = createV0Client({
  auth: process.env.V0_API_KEY!,
})

const response = await v0.chats.create({
  body: {
    type: 'prompt',
    message: 'Build me a cool personal website',
  },
})

if (response.error) throw new Error(response.error.message)

console.log(`Created chat ${response.data.chat.id}`)
