import type { AnyFunction } from "../types/types.ts";
import type { Ticker } from "./types.ts";
export declare const ticker: Ticker;
export declare const setImmediate: <T extends AnyFunction>(callback: T, callbackArgs?: unknown[] | Parameters<T> | undefined) => number, clearImmediate: (immediate: number) => null;
//# sourceMappingURL=timing.d.ts.map