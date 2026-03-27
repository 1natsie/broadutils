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
export const { setImmediate, clearImmediate, } = (() => {
    const immediateQueue = new Map();
    const channel = new MessageChannel();
    const dummyEntry = {
        callback: () => { },
        arguments: [],
        canceled: false,
    };
    const drainQueue = () => {
        const queue = [...immediateQueue.values()];
        immediateQueue.clear();
        awaitingDrain = false;
        for (let i = 0; i < queue.length; ++i) {
            const entry = queue[i];
            if (!entry || entry.canceled)
                continue;
            try {
                entry.callback(...entry.arguments);
            }
            catch (error) {
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
        setImmediate: (callback, args = []) => {
            if (typeof callback !== "function")
                throw new TypeError("Invalid callback.");
            if (!Array.isArray(args))
                throw new TypeError("Invalid callback arguments.");
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
        clearImmediate: (immediate) => {
            (immediateQueue.get(immediate) || dummyEntry).canceled = true;
            return null;
        },
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