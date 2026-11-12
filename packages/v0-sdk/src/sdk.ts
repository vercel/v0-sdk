import { Chats as GeneratedChats, type Options, V0Sdk as GeneratedV0Sdk } from './generated/sdk.gen'

/**
 * The generated `Chats`, with artifact downloads returned as a Blob.
 * Artifacts can be HTML, Markdown, CSV or JSON, which `parseAs: 'auto'` would
 * return as text or parsed JSON instead of the Blob the response type declares.
 */
export class Chats extends GeneratedChats {
  override downloadArtifact<ThrowOnError extends boolean = false>(
    parameters: Parameters<GeneratedChats['downloadArtifact']>[0],
    options?: Options<never, ThrowOnError>,
  ) {
    return super.downloadArtifact<ThrowOnError>(parameters, { parseAs: 'blob', ...options })
  }
}

/** The generated `V0Sdk`, using {@link Chats}. */
export class V0Sdk extends GeneratedV0Sdk {
  private _blobChats?: Chats

  override get chats(): Chats {
    return (this._blobChats ??= new Chats({ client: this.client }))
  }
}
