import type { AnyFunction, CallbackFunctionOne } from "../types/types.ts";

export interface Deferred<T> {
  promise: Promise<T>;
  resolve: CallbackFunctionOne<T>;
  reject: CallbackFunctionOne<unknown>;
}

export interface ChunkReaderOptions {
  offset: number;
  chunkSize: number;
  length: number;
}

export interface Immediate {
  Immediate: number;
  SetImmediate: {
    <T extends AnyFunction>(
      callback: T,
      callbackArgs?: Parameters<T> | unknown[],
    ): Immediate["Immediate"];
  };
  ClearImmediate: (immediate: Immediate["Immediate"]) => null;
}
