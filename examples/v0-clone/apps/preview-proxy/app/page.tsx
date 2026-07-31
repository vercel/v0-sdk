import { getCloneOrigin } from '@/lib/origins'

export const dynamic = 'force-dynamic'

export default function PreviewProxyPage() {
  const configuration = getConfiguration()

  return (
    <main
      style={{
        alignItems: 'center',
        background: '#fafafa',
        color: '#111',
        display: 'flex',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 24,
      }}
    >
      <section
        style={{
          background: '#fff',
          border: '1px solid #e5e5e5',
          borderRadius: 12,
          boxShadow: '0 12px 32px rgb(0 0 0 / 6%)',
          maxWidth: 520,
          padding: 32,
          width: '100%',
        }}
      >
        <div style={{ alignItems: 'center', display: 'flex', gap: 10 }}>
          <span
            aria-hidden
            style={{
              background: configuration.ready ? '#22c55e' : '#f59e0b',
              borderRadius: '50%',
              height: 8,
              width: 8,
            }}
          />
          <span style={{ color: '#525252', fontSize: 13, fontWeight: 600 }}>
            {configuration.ready ? 'Proxy online' : 'Configuration required'}
          </span>
        </div>
        <h1 style={{ fontSize: 24, letterSpacing: '-0.03em', margin: '20px 0 10px' }}>
          v0 Preview Proxy
        </h1>
        <p style={{ color: '#525252', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
          This deployment is the isolated origin used to serve generated previews. Open the v0 clone
          app to create and view chats.
        </p>
        <dl
          style={{
            background: '#fafafa',
            border: '1px solid #ededed',
            borderRadius: 8,
            fontSize: 13,
            margin: '24px 0 0',
            padding: 16,
          }}
        >
          <dt style={{ color: '#737373', marginBottom: 6 }}>Allowed clone origin</dt>
          <dd style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace', margin: 0 }}>
            {configuration.value}
          </dd>
        </dl>
        {configuration.ready ? (
          <a
            href={configuration.value}
            style={{
              background: '#111',
              borderRadius: 8,
              color: '#fff',
              display: 'inline-block',
              fontSize: 14,
              fontWeight: 600,
              marginTop: 20,
              padding: '10px 14px',
              textDecoration: 'none',
            }}
          >
            Open v0 Clone
          </a>
        ) : null}
      </section>
    </main>
  )
}

function getConfiguration() {
  try {
    return { ready: true, value: getCloneOrigin() }
  } catch (error) {
    return {
      ready: false,
      value: error instanceof Error ? error.message : 'V0_CLONE_ORIGIN is invalid.',
    }
  }
}
