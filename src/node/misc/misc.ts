import type { CreateDeferred, Deferred, GCUtils } from "./types.ts";

export const noop = (...args: unknown[]): null => null;

export const createDeferred: CreateDeferred = async <T>(): Promise<Deferred<T>> => {
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

const gcUtils: GCUtils = (() => {
  const preserveSymbol = Symbol("preserved");
  const preserveSet: Set<any> = new Set();
  Object.defineProperty(globalThis, preserveSymbol, {
    value: preserveSet,
    enumerable: false,
  });

  return {
    allowGC: (value: any) => (preserveSet.delete(value), null),
    preventGC: (value: any) => (preserveSet.add(value), null),
  };
})();

export const allowGC = gcUtils.allowGC;
export const preventGC = gcUtils.preventGC;

export * from "./types.ts";
