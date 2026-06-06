import type { CallbackFunctionOne } from "../types/types.ts";
export interface Deferred<T> {
    /** The promise associated with this deferred object. */
    promise: Promise<T>;
    /** The resolve function for the promise referenced by this deferred object. */
    resolve: CallbackFunctionOne<T>;
    /** The reject function for the promise referenced by this deferred object. */
    reject: CallbackFunctionOne<unknown>;
}
export interface CreateDeferred {
    /**
     * Creates a deferred object that contains a promise and its associated resolve and reject
     * functions. The promise is initialized asynchronously to ensure that the resolve and reject
     * functions are properly assigned before the promise is used.
     */
    <T>(): Promise<Deferred<T>>;
}
export interface GCUtils {
    /**
     * Allows the garbage collector to collect the specified value by removing it from the internal
     * preservation set. This is useful for managing memory and ensuring that objects are not kept
     * alive unnecessarily.
     *
     * @param value - The value to allow for garbage collection.
     *
     * @warning This function only removes the value from its internal preservation set. Other
     * references to the value elsewhere in the code may still prevent it from being collected by the
     * garbage collector. Use with caution to avoid unintended memory leaks.
     */
    allowGC(value: any): null;
    /**
     * Prevents the garbage collector from collecting the specified value by adding it to an internal
     * preservation set. This is useful for keeping objects alive that are still needed, even if they
     * are not referenced elsewhere in the code.
     *
     * @param value - The value to prevent from garbage collection.
     *
     * @warning This function adds the value to an internal preservation set, which may lead to memory
     * leaks if not used carefully. Ensure that you call `allowGC` for the same value when it is no
     * longer needed to allow it to be collected by the garbage collector.
     */
    preventGC(value: any): null;
}
//# sourceMappingURL=types.d.ts.map