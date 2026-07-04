import type { PathLike } from "fs";

/**
 * Defines the options for the `betterReadStream` function, which allows you to specify how a file
 * should be read in chunks.
 */
export interface BetterReadStreamOptions {
  /** The starting byte position to begin reading from (default is `0`). */
  offset?: number;
  /** The total number of bytes to read (default is the entire file). */
  length?: number;
  /** The size of each chunk to read in bytes (default is `16 * 1024` or 16KB). */
  chunkSize?: number;
}

export interface BetterReadStream {
  /**
   * Creates an asynchronous generator that reads a file in chunks, yielding each chunk as a
   * `Buffer`. The function accepts a file path and an optional configuration object that allows
   * you to specify the offset, length, and chunk size for reading the file. If no options are
   * provided, it reads the entire file in default chunk sizes.
   *
   * @param path - The path to the file to be read.
   * @param options - An optional configuration object that can include:
   *   - `offset`: The starting byte position to begin reading from (default is `0`).
   *   - `length`: The total number of bytes to read (default is the entire file).
   *   - `chunkSize`: The size of each chunk to read in bytes (default is `16 * 1024` or 16KB).
   * @returns An asynchronous generator that yields each chunk of the file as a `Buffer`.
   */
  (
    path: PathLike,
    options?: BetterReadStreamOptions,
  ): AsyncGenerator<Buffer<ArrayBuffer>, void, unknown>;
}
