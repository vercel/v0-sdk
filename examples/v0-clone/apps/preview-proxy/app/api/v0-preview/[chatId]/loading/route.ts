import { getCloneOrigin } from '@/lib/origins'

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

export async function GET(request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params
  const previewPath = `/api/v0-preview/${encodeURIComponent(chatId)}`
  const requestedReturnTo = new URL(request.url).searchParams.get('returnTo')
  const returnTo =
    requestedReturnTo === previewPath ||
    requestedReturnTo?.startsWith(`${previewPath}/`) ||
    requestedReturnTo?.startsWith(`${previewPath}?`)
      ? requestedReturnTo
      : previewPath
  const cloneOrigin = getCloneOrigin()

  return new Response(
    `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="refresh" content="2;url=${escapeHtml(returnTo)}" />
    <script>
      const notifyParent = () => parent.postMessage(
        { type: 'v0-preview-loading' },
        ${JSON.stringify(cloneOrigin)}
      )
      notifyParent()
      setInterval(notifyParent, 250)
    </script>
    <style>
      html, body { height: 100%; margin: 0; }
      body {
        align-items: center;
        background: #fafafa;
        color: #666;
        display: flex;
        font: 14px system-ui, sans-serif;
        justify-content: center;
      }
    </style>
  </head>
  <body>Loading preview…</body>
</html>`,
    {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'text/html; charset=utf-8',
      },
    },
  )
}
