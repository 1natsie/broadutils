import type { Deferred, ChunkReaderOptions } from "./types.ts";
export declare const noop: (...args: unknown[]) => null;
export declare const createDeferred: <T>() => Promise<Deferred<T>>;
export declare const allowGC: (value: any) => null, preventGC: (value: any) => null;
export declare const readFileChunks: (path: string, options?: Partial<ChunkReaderOptions> | undefined) => AsyncGenerator<Buffer<ArrayBuffer>, void, unknown>;
export * from "./types.ts";
//# sourceMappingURL=misc.d.ts.map