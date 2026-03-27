import type { AnyFunction } from "../types/types.ts";
import type { Deferred, ChunkReaderOptions, Immediate } from "./types.ts";

export const noop = (...args: unknown[]): null => null;

export const createDeferred = async <T>(): Promise<Deferred<T>> => {
  const deferred: Deferred<T> = {
    promise: {} as Promise<T>,
    resolve: noop,
    reject: noop,
  };

  await new Promise((rresolved) => {
    deferred.promise = new Promise<T>((resolve, reject) => {
      deferred.resolve = resolve;
      deferred.reject = reject;
      rresolved(null);
    });
  });

  return deferred;
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

export const readFileChunks = async function* (
  path: string,
  options?: Partial<ChunkReaderOptions>,
) {
  const { open } = await import("node:fs/promises");

  const fileHandle = await open(path);
  const config: ChunkReaderOptions = {
    offset: Math.floor(options?.offset ?? 0),
    chunkSize: Math.floor(options?.chunkSize ?? 2 ** 16),
    length: Math.floor(options?.length ?? -1),
  };

  try {
    const stats = await fileHandle.stat();

    if (config.offset < 0) throw new RangeError("Invalid offset.");
    if (config.offset >= stats.size) throw new RangeError("Offset exceed file size.");
    config.length === -1 && (config.length = stats.size);
    config.length = Math.min(config.length, stats.size - config.offset);
    if (config.length < 0) throw new RangeError("Invalid length.");
    if (config.chunkSize < 0) throw new RangeError("Invalid chunk size.");

    const endOffset = config.offset + config.length;
    let offset = config.offset;
    while (offset < endOffset) {
      const readSize = Math.min(endOffset - offset, config.chunkSize);
      const readResult = await fileHandle.read(Buffer.allocUnsafe(readSize), 0, readSize, offset);

      offset += readSize;
      yield readResult.buffer;
    }
  } finally {
    fileHandle.close();
  }
};

export * from "./types.ts";
