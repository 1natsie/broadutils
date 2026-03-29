import type { AnyFunction } from "../types/types.ts";
import type { Immediate, Ticker, TickerCallback } from "./types.ts";

export const ticker: Ticker = {
  callbacks: new Map(),
  allowedDeviation: 0.01,
  running: false,

  setDeviation: (deviation: number) => {
    ticker.allowedDeviation = deviation;
    return ticker;
  },

  addCallback: (callback: TickerCallback, targetTps: number) => {
    if (ticker.callbacks.has(callback)) return ticker;

    ticker.callbacks.set(callback, {
      callback: callback,
      targetTps: targetTps,
      targetInterval: 1000 / targetTps,
      lastTickTime: -1,
    });

    return ticker;
  },

  removeCallback: (callback: TickerCallback) => {
    ticker.callbacks.delete(callback);
    return ticker;
  },

  start: () => {
    if (ticker.running) return null;
    ticker.running = true;
    setImmediate(ticker.tick);
    return null;
  },

  pause: () => {
    ticker.running = false;
    return null;
  },

  tick: () => {
    if (!ticker.running) return null;

    for (const data of ticker.callbacks.values()) {
      const timeSinceLastTick = performance.now() - data.lastTickTime;
      const tickDiff = (1 - ticker.allowedDeviation) * data.targetInterval;
      if (timeSinceLastTick < tickDiff && data.lastTickTime !== -1) continue;

      data.callback(timeSinceLastTick);
      data.lastTickTime = performance.now();
    }

    ticker.running && setImmediate(ticker.tick);
    return null;
  },
};

export const {
  setImmediate,
  clearImmediate,
}: { setImmediate: Immediate["SetImmediate"]; clearImmediate: Immediate["ClearImmediate"] } =
  (() => {
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
