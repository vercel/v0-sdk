import type { SWRResponse } from 'swr'

import * as V0React from '../src'
import type { ChatsGetResponse } from '../src'
import { useChat, useDownloadChatFiles, useMessages, useSendMessage } from '../src/swr'

export function verifyPublicTypes() {
  // @ts-expect-error SWR hooks are only exported from the /swr entrypoint.
  void V0React.useChat

  const chat: SWRResponse<ChatsGetResponse> = useChat('/api/v0/chats/chat_1')
  void chat

  useMessages('/api/v0/chats/chat_1/messages', { limit: 20 })

  const send = useSendMessage('/api/v0/chats/chat_1/messages/stream')
  send.trigger({ message: 'Hello' })
  // @ts-expect-error Path parameters belong in the URL, not in the trigger body.
  send.trigger({ chatId: 'chat_1', message: 'Hello' })

  const download = useDownloadChatFiles('/api/v0/chats/chat_1/files/download')
  const blob: Promise<Blob> = download.trigger()
  void blob
}
