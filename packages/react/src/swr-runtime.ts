import useSWR, { type Key, type SWRConfiguration } from 'swr'
import useSWRInfinite, {
  type SWRInfiniteConfiguration,
  type SWRInfiniteKeyLoader,
} from 'swr/infinite'
import useSWRMutation, { type SWRMutationConfiguration } from 'swr/mutation'

import {
  requestV0Operation,
  type V0Operation,
  type V0RequestOptions,
  type V0ResponseError,
} from './request'

export type V0Url = string | null

export interface V0QueryConfiguration<Data, ErrorBody = unknown> extends SWRConfiguration<
  Data,
  V0ResponseError<ErrorBody>
> {
  /** Disable this query without changing hook order. */
  enabled?: boolean
  /** Override request options for this hook. */
  request?: V0RequestOptions
}

export interface V0InfiniteConfiguration<
  Data,
  ErrorBody = unknown,
> extends SWRInfiniteConfiguration<Data, V0ResponseError<ErrorBody>> {
  /** Disable this query without changing hook order. */
  enabled?: boolean
  /** Override request options for this hook. */
  request?: V0RequestOptions
}

export interface V0MutationConfiguration<Data, ErrorBody, Input> extends SWRMutationConfiguration<
  Data,
  V0ResponseError<ErrorBody>,
  Key,
  Input,
  Data
> {
  /** Override request options for this hook. */
  request?: V0RequestOptions
}

export function createV0Key(
  operation: string,
  url: string,
  input: unknown,
): readonly ['v0', string, string, unknown] {
  return ['v0', operation, url, input] as const
}

export function useV0Query<Data, ErrorBody, Input>(
  operation: V0Operation<Data>,
  url: V0Url,
  input: Input,
  configuration: V0QueryConfiguration<Data, ErrorBody> = {},
) {
  const { enabled, request, ...swrConfiguration } = configuration
  const key = url && enabled !== false ? createV0Key(operation.id, url, input) : null

  return useSWR<Data, V0ResponseError<ErrorBody>>(
    key,
    () => requestV0Operation<Data, ErrorBody>(url!, operation, input, request),
    swrConfiguration,
  )
}

export function useV0Mutation<Data, ErrorBody, Input>(
  operation: V0Operation<Data>,
  url: string,
  configuration: V0MutationConfiguration<Data, ErrorBody, Input> = {},
) {
  const { request, ...swrConfiguration } = configuration
  const key = createV0Key(operation.id, url, null)

  return useSWRMutation<Data, V0ResponseError<ErrorBody>, Key, Input>(
    key,
    (_key: Key, { arg }: { arg: Input }) =>
      requestV0Operation<Data, ErrorBody>(url, operation, arg, request),
    swrConfiguration,
  )
}

export function useV0CursorQuery<Page, ErrorBody, Input extends object>(
  operation: V0Operation<Page>,
  url: V0Url,
  input: Input | null,
  getCursor: (page: Page) => string | null | undefined,
  configuration: V0InfiniteConfiguration<Page, ErrorBody> = {},
) {
  const { enabled, request, ...swrConfiguration } = configuration

  const getKey: SWRInfiniteKeyLoader = (index, previousPage: Page | null) => {
    if (!url || !input || enabled === false) return null
    if (index > 0 && (!previousPage || !getCursor(previousPage))) return null

    const pageInput = {
      ...input,
      ...(index > 0 ? { cursor: getCursor(previousPage!) } : {}),
    } as Input

    return createV0Key(operation.id, url, pageInput)
  }

  return useSWRInfinite<Page, V0ResponseError<ErrorBody>>(
    getKey,
    (key) => requestV0Operation<Page, ErrorBody>(url!, operation, key.at(-1), request),
    swrConfiguration,
  )
}
