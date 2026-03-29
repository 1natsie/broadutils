import type { AnyFunction, CallbackFunction } from "../types/types.ts";

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

export type TickerCallback = CallbackFunction<[number]>;

interface TickerCallbackData {
  callback: TickerCallback;
  targetTps: number;
  targetInterval: number;
  lastTickTime: number;
}

export interface Ticker {
  callbacks: Map<TickerCallback, TickerCallbackData>;
  allowedDeviation: number;
  running: boolean;

  setDeviation: (deviation: number) => Ticker;
  addCallback: (callback: TickerCallback, targetTps: number) => Ticker;
  removeCallback: (callback: TickerCallback) => Ticker;
  start: () => null;
  pause: () => null;
  tick: () => null;
}
