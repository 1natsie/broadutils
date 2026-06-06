import type { AnyFunction } from "../types/types.ts";
import type { Immediate, Sleep, Time } from "./types.ts";

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

const immediateUtils: {
  setImmediate: Immediate["SetImmediate"];
  clearImmediate: Immediate["ClearImmediate"];
} = (() => {
  type Immediate = number;
  type QueueEntry = {
    callback: AnyFunction;
    arguments: unknown[];
    canceled: boolean;
  };

  const immediateQueue = new Map<Immediate, QueueEntry>();
  const channel = new MessageChannel();
  const dummyEntry: QueueEntry = {
    callback: () => {},
    arguments: [],
    canceled: false,
  };

  const drainQueue = () => {
    const queue = [...immediateQueue.values()];
    immediateQueue.clear();
    awaitingDrain = false;

    for (let i = 0; i < queue.length; ++i) {
      const entry = queue[i];
      if (!entry || entry.canceled) continue;

      try {
        entry.callback(...entry.arguments);
      } catch (error) {
        console.log("An error occured whilst executing an immediate callback.");
        console.error(error);
      }
    }

    return null;
  };

  let awaitingDrain = false;
  let immediate = 0;

  channel.port2.onmessage = drainQueue;
  return {
    setImmediate: <T extends AnyFunction>(callback: T, args: unknown[] = []): Immediate => {
      if (typeof callback !== "function") throw new TypeError("Invalid callback.");
      if (!Array.isArray(args)) throw new TypeError("Invalid callback arguments.");

      const _immediate = immediate++;
      immediateQueue.set(_immediate, {
        callback,
        arguments: args,
        canceled: false,
      });

      if (!awaitingDrain) {
        channel.port1.postMessage(null);
        awaitingDrain = true;
      }

      return _immediate;
    },
    clearImmediate: (immediate: Immediate): null => {
      (immediateQueue.get(immediate) || dummyEntry).canceled = true;
      return null;
    },
  };
})();

export const setImmediate: Immediate["SetImmediate"] = immediateUtils.setImmediate;
export const clearImmediate: Immediate["ClearImmediate"] = immediateUtils.clearImmediate;

export * from "./types.ts";
