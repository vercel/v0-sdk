import { revalidatePath } from 'next/cache'
import type { ChatsCreateStreamData, ChatsListData } from 'v0'
import { toV0JsonResponse } from '@/lib/v0-response'
import { authorizeProxyRequest } from '@/lib/proxy'
import { v0 } from '@/lib/v0-client'

type CreateChatBody = Pick<ChatsCreateStreamData['body'], 'message' | 'modelConfiguration'>

export async function GET(request: Request) {
  const denied = authorizeProxyRequest(request)
  if (denied) return denied
  const searchParams = new URL(request.url).searchParams
  const limit = Number(searchParams.get('limit') ?? 20)

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return Response.json({ message: 'limit must be between 1 and 100.' }, { status: 400 })
  }

  const metadata = parseMetadata(searchParams)
  const query: ChatsListData['query'] = {
    limit,
    ...(searchParams.get('cursor') ? { cursor: searchParams.get('cursor')! } : {}),
    ...(searchParams.get('authorId') ? { authorId: searchParams.get('authorId')! } : {}),
    ...(searchParams.get('vercelProjectId')
      ? { vercelProjectId: searchParams.get('vercelProjectId')! }
      : {}),
    ...(Object.keys(metadata).length > 0 ? { metadata } : {}),
  }
  const result = await v0.chats.list(query)

  return toV0JsonResponse(result)
}

export async function POST(request: Request) {
  const denied = authorizeProxyRequest(request)
  if (denied) return denied
  const body = (await request.json().catch(() => null)) as CreateChatBody | null

  if (typeof body?.message !== 'string' || !body.message.trim()) {
    return Response.json({ message: 'Enter a message.' }, { status: 400 })
  }

  const result = await v0.chats.createStream({
    message: body.message.trim(),
    modelConfiguration: body.modelConfiguration,
    privacy: 'private',
  })

  revalidatePath('/', 'layout')
  return result.toResponse()
}

function parseMetadata(searchParams: URLSearchParams) {
  const metadata: Record<string, string> = {}

  for (const [key, value] of searchParams) {
    const match = /^metadata\[([^\]]+)\]$/.exec(key)
    if (match?.[1]) metadata[match[1]] = value
  }

  return metadata
}
