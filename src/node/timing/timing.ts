import type { AnyFunction } from "../types/types.ts";
import type { Sleep, Time } from "./types.ts";

export const time: Time = <T extends AnyFunction>(
  func: T,
  warmupCount: number = 0,
  runCount: number = 1,
): [duration: number, result: ReturnType<T>] => {
  for (let i = 0; i < warmupCount; i++) func();

  let result!: ReturnType<T>;
  const startTime = performance.now();
  for (let i = 0; i < runCount; i++) result = func();

  return [(performance.now() - startTime) / runCount, result];
};

export const sleep: Sleep = Object.assign(
  (duration: number): Promise<number> => {
    const scheduledAt = performance.now();
    let resolvedDuration = Number.isFinite(+duration) ? +duration : 0;

    resolvedDuration < 0 && (resolvedDuration = 0);
    resolvedDuration > 2 ** 31 - 1 && (resolvedDuration = 0);

    return new Promise((resolve) => {
      setTimeout(() => resolve(performance.now() - scheduledAt), resolvedDuration);
    });
  },
  {
    sync: (duration: number): number => {
      const scheduledAt = performance.now();
      let resolvedDuration = Number.isFinite(+duration) ? +duration : 0;
      let _duration = 0;

      resolvedDuration < 0 && (resolvedDuration = 0);
      resolvedDuration > 2 ** 31 - 1 && (resolvedDuration = 0);

      while ((_duration = performance.now() - scheduledAt) < resolvedDuration);
      return _duration;
    },
  },
);

export * from "./types.ts";
