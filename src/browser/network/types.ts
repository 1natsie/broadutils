export type FetchParams = [input: string | URL | Request, init?: RequestInit];
export type ExtendedFetchResult<T> = readonly [Response, T];
export type LoadMetadata = <T extends HTMLMediaElement>(mediaElement: T) => Promise<T>;

export interface ExtendedFetch {
  /** Returns a promise resolving to the Response object. */
  (...params: FetchParams): Promise<Response>;
  /** Returns a promise resolving to the Response object if the request was successful, otherwise rejects. */
  ok: (...params: FetchParams) => Promise<Response & { ok: true }>;
  /** Returns a promise resolving to `[Response, ArrayBuffer]`. */
  arraybuffer: (...params: FetchParams) => Promise<ExtendedFetchResult<ArrayBuffer>>;
  /** Returns a promise resolving to `[Response, Blob]`. */
  blob: (...params: FetchParams) => Promise<ExtendedFetchResult<Blob>>;
  /** Returns a promise resolving to `[Response, Uint8Array]`. */
  bytes: (...params: FetchParams) => Promise<ExtendedFetchResult<Uint8Array<ArrayBuffer>>>;
  /** Returns a promise resolving to `[Response, Record<string, string>]`. */
  headers: (...params: FetchParams) => Promise<ExtendedFetchResult<Record<string, string>>>;
  /** Returns a promise resolving to `[Response, T]` (where `T` is the type of the parsed JSON). */
  json: <T = unknown>(...params: FetchParams) => Promise<ExtendedFetchResult<T>>;
  /** Returns a promise resolving to `[Response, ReadableStream<Uint8Array<ArrayBuffer>>]`. */
  stream: (
    ...params: FetchParams
  ) => Promise<ExtendedFetchResult<ReadableStream<Uint8Array<ArrayBuffer>>>>;
  /** Returns a promise resolving to `[Response, string]`. */
  text: (...params: FetchParams) => Promise<ExtendedFetchResult<string>>;

  /** Returns a promise resolving to an HTMLAudioElement with loaded metadata. */
  audio: (...params: FetchParams) => Promise<HTMLAudioElement>;
  /** Returns a promise resolving to a decoded HTMLImageElement. */
  image: (...params: FetchParams) => Promise<HTMLImageElement>;
  /** Returns a promise resolving to an HTMLVideoElement with loaded metadata. */
  video: (...params: FetchParams) => Promise<HTMLVideoElement>;
}
