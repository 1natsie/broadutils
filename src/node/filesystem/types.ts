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

/**
 * Defines the options for the `which` function, which is used to locate the executable file for a
 * given command name in the system's PATH. The options allow you to specify whether to include the
 * current working directory in the search, provide a custom working directory, and supply a custom
 * environment variable object for the search.
 */
export interface WhichOptions {
  /** Whether to include the current working directory in the search (default is `false`). */
  includeCwd?: boolean;
  /** The working directory to search in (default is `undefined`). Implies `includeCwd: true`. */
  cwd?: string;
  /** The environment variables to use for the search (default is the current environment). */
  env?: Record<string, string>;
}

export interface Which {
  /**
   * Locates the executable file for a given command name in the system's PATH. The function
   * accepts a command name and an optional configuration object that allows you to modify the
   * search behavior. It returns the resolved path to the executable if found, or `null` if the
   * executable cannot be located.
   *
   * @param name - The name of the command to locate (e.g., "node").
   * @param options - An optional configuration object that can include:
   *   - `includeCwd`: Whether to include the current working directory in the search (default is `false`).
   *   - `cwd`: The working directory to search in (default is `undefined`). Implies `includeCwd: true`.
   *   - `env`: The environment variables to use for the search (default is the current environment).
   * @returns The resolved path to the executable if found, or `null` if not found.
   */
  (name: string, options?: WhichOptions): string | null;

  /**
   * Locates the executable files for an array of command names in the system's PATH. The function
   * accepts an array of command names and an optional configuration object that allows you to
   * modify the search behavior. It returns an object mapping each command name to its resolved
   * path or `null` if not found.
   *
   * @param names - An array of command names to locate (e.g., ["node", "npm"]).
   * @param options - An optional configuration object that can include:
   *   - `includeCwd`: Whether to include the current working directory in the search (default is `false`).
   *   - `cwd`: The working directory to search in (default is `undefined`). Implies `includeCwd: true`.
   *   - `env`: The environment variables to use for the search (default is the current environment).
   * @returns An object mapping each command name to its resolved path or `null` if not found.
   */
  readonly many: <T extends string[]>(
    names: T,
    options?: WhichOptions,
  ) => { [Name in T[number]]: string | null };
}
