import { proxyPreviewRequest } from '@/lib/preview'

type RouteContext = {
  params: Promise<{ chatId: string; path?: string[] }>
}

async function handler(request: Request, context: RouteContext) {
  const { chatId, path = [] } = await context.params
  return proxyPreviewRequest(request, chatId, path)
}

export {
  handler as DELETE,
  handler as GET,
  handler as HEAD,
  handler as OPTIONS,
  handler as PATCH,
  handler as POST,
  handler as PUT,
}
