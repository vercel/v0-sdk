import { v0 } from 'v0'

const response = await v0.chats.create({
  message: 'Build me a cool personal website',
})

if (response.error) throw new Error(response.error.message)

console.log(`Created chat ${response.data.chat.id}`)
