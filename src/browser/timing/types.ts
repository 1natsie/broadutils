import type { AnyFunction } from "../types/types.ts";

export interface Immediate {
  /** A unique identifier for the immediate callback. */
  Immediate: number;

  /**
   * Schedules a function to be called immediately after the current event loop tick. The callback
   * is executed as soon as the current call stack is clear, but before any I/O events or timers.
   * This can be useful for deferring execution of a function until after the current code has
   * finished.
   *
   * @param callback The function to be executed immediately after the current event loop tick.
   * @param callbackArgs Optional arguments to be passed to the callback function when it is executed.
   * @returns A unique identifier for the scheduled immediate callback, which can be used to cancel
   * it with `clearImmediate()`.
   *
   * @example
   * ```ts
   * const id = setImmediate(() => {
   *   console.log("This will run immediately after the current event loop tick.");
   * });
   * ```
   */
  SetImmediate: {
    <T extends AnyFunction>(
      callback: T,
      callbackArgs?: Parameters<T> | unknown[],
    ): Immediate["Immediate"];
  };

  /**
   * Cancels an immediate callback that was scheduled using `setImmediate()`.
   *
   * @param immediate The unique identifier of the immediate callback to cancel, as returned by
   * `setImmediate()`.
   * @returns `null` after the specified immediate callback has been canceled. If the immediate
   * callback has already been executed or canceled, this function does nothing and returns `null`.
   *
   * @example
   * ```ts
   * const id = setImmediate(() => {
   *   console.log("This will not run because it will be canceled.");
   * });
   * clearImmediate(id);
   * ```
   */
  ClearImmediate: (immediate: Immediate["Immediate"]) => null;
}

export interface Sleep {
  /**
   * Returns a promise that resolves after a specified duration in milliseconds. The resolved value
   * is the actual duration of the sleep, which may differ from the requested duration due to
   * factors such as event loop delays and system load. The `sync` method blocks the main thread
   * for the specified duration and returns the actual duration of the sleep. Note that using
   * `sync` can lead to performance issues and should be used with caution, especially in
   * environments where responsiveness is critical.
   *
   * @param duration The duration of time in milliseconds to sleep.
   * @returns A promise that resolves to the actual time elapsed between calling the `sleep()`
   * method and it resolving. This may differ from the requested duration due to factors such as
   * event loop delays and system load.
   *
   * @example
   * ```ts
   * sleep(1000).then((actualDuration) => {
   *   console.log(`Slept for approximately ${actualDuration} ms`);
   * });
   * ```
   */
  (duration: number): Promise<number>;

  /**
   * Blocks the main thread for the specified duration and returns the actual duration of the sleep.
   *
   * @param duration The duration of time in milliseconds for which to block the main thread.
   * @returns The actual time elapsed between calling the `sleep.sync()` method and it returning.
   * This may differ from the requested duration due to factors such as event loop delays and system
   * load.
   *
   * @example
   * ```ts
   * const actualDuration = sleep.sync(1000);
   * console.log(`Slept for approximately ${actualDuration} ms`);
   * ```
   *
   * @warning Using `sleep.sync()` can lead to performance issues and should be used with caution,
   * especially in environments where responsiveness is critical, such as in a browser. It blocks
   * the main thread, which can cause the UI to become unresponsive.
   */
  sync: (duration: number) => number;
}

export interface Time {
  /**
   * Measures the average execution time of a given function over a specified number of runs, with
   * an optional warmup phase. The function is executed a certain number of times for warmup (to
   * allow for optimizations like JIT compilation) and then executed a specified number of times to
   * measure the average duration. The result includes both the average duration and the result of
   * the last execution of the function.
   *
   * @param func The function to be timed.
   * @param warmupCount The number of times to execute the function for warmup. This allows for
   * optimizations like JIT compilation to take effect before measuring. Default is 0 (no warmup).
   * @param runCount The number of times to execute the function for timing. The average duration
   * will be calculated based on these runs. Default is 1.
   * @returns A tuple containing the average duration of the function execution in milliseconds and
   * the result of the last execution of the function.
   *
   * @example
   * ```ts
   * const [duration, result] = time(() => {
   *   // Some code to be timed
   * }, 10, 100);
   * console.log(`Average duration: ${duration} ms, Result: ${result}`);
   * ```
   */
  <T extends AnyFunction>(
    func: T,
    warmupCount: number,
    runCount: number,
  ): [duration: number, result: ReturnType<T>];
}
