export const noop = (...args) => null;
export const createDeferred = async () => {
    const deferred = {
        promise: {},
        resolve: noop,
        reject: noop,
    };
    await new Promise((rresolved) => {
        deferred.promise = new Promise((resolve, reject) => {
            deferred.resolve = resolve;
            deferred.reject = reject;
            rresolved(null);
        });
    });
    return deferred;
};
export const { allowGC, preventGC } = (() => {
    const preserveSymbol = Symbol.for(crypto.randomUUID());
    const preserveSet = new Set();
    Object.defineProperty(globalThis, preserveSymbol, {
        value: preserveSet,
        enumerable: false,
    });
    return {
        allowGC: (value) => (preserveSet.delete(value), null),
        preventGC: (value) => (preserveSet.add(value), null),
    };
})();
export const readFileChunks = async function* (path, options) {
    const { open } = await import("node:fs/promises");
    const fileHandle = await open(path);
    const config = {
        offset: Math.floor(options?.offset ?? 0),
        chunkSize: Math.floor(options?.chunkSize ?? 2 ** 16),
        length: Math.floor(options?.length ?? -1),
    };
    try {
        const stats = await fileHandle.stat();
        if (config.offset < 0)
            throw new RangeError("Invalid offset.");
        if (config.offset >= stats.size)
            throw new RangeError("Offset exceed file size.");
        config.length === -1 && (config.length = stats.size);
        config.length = Math.min(config.length, stats.size - config.offset);
        if (config.length < 0)
            throw new RangeError("Invalid length.");
        if (config.chunkSize < 0)
            throw new RangeError("Invalid chunk size.");
        const endOffset = config.offset + config.length;
        let offset = config.offset;
        while (offset < endOffset) {
            const readSize = Math.min(endOffset - offset, config.chunkSize);
            const readResult = await fileHandle.read(Buffer.allocUnsafe(readSize), 0, readSize, offset);
            offset += readSize;
            yield readResult.buffer;
        }
    }
    finally {
        fileHandle.close();
    }
};
export * from "./types.js";
//# sourceMappingURL=misc.js.map