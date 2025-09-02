// Global type declarations for headless compatibility

declare global {
  interface Console {
    warn(...data: any[]): void
  }

  var console: Console

  // Web Streams API types for headless environments
  interface ReadableStream<R = any> {
    readonly locked: boolean
    getReader(): ReadableStreamDefaultReader<R>
  }

  interface ReadableStreamDefaultReader<R = any> {
    read(): Promise<ReadableStreamReadResult<R>>
    releaseLock(): void
  }

  interface ReadableStreamReadResult<T> {
    done: boolean
    value?: T
  }

  var ReadableStream: {
    prototype: ReadableStream
    new <R = any>(): ReadableStream<R>
  }

  // Text encoding/decoding
  interface TextDecoder {
    decode(input?: BufferSource, options?: TextDecodeOptions): string
  }

  interface TextDecodeOptions {
    stream?: boolean
  }

  var TextDecoder: {
    prototype: TextDecoder
    new (label?: string, options?: TextDecoderOptions): TextDecoder
  }

  interface TextDecoderOptions {
    fatal?: boolean
    ignoreBOM?: boolean
  }
}

export {}
