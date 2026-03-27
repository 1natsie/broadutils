import type { AnyFunction } from "../types/types.ts";
import type { Deferred, ChunkReaderOptions } from "./types.ts";
export declare const noop: (...args: unknown[]) => null;
export declare const createDeferred: <T>() => Promise<Deferred<T>>;
export declare const setImmediate: <T extends AnyFunction>(callback: T, callbackArgs?: unknown[] | Parameters<T> | undefined) => number, clearImmediate: (immediate: number) => null;
export declare const readFileChunks: (path: string, options?: Partial<ChunkReaderOptions> | undefined) => AsyncGenerator<Buffer<ArrayBuffer>, void, unknown>;
export * from "./types.ts";
//# sourceMappingURL=misc.d.ts.map