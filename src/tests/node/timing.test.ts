import { afterEach, describe, expect, it } from "bun:test";
import { clearImmediate, setImmediate, ticker } from "../../timing/timing.ts";

describe("Timing utilities", () => {
  describe("ticker", () => {
    const tickFn = () => tickCount++;
    let tickCount = 0;

    afterEach(() => {
      ticker.callbacks.clear();
      ticker.pause();
    });

    it(".addCallback() should an a callback to the callbacks map", () => {
      const previousSize = ticker.callbacks.size;
      ticker.addCallback(tickFn, 60);
      expect(ticker.callbacks.size).toBeGreaterThan(previousSize);
      expect(ticker.callbacks.get(tickFn)).toBeObject();
    });

    it(".removeCallback() should remove a callback from the callbacks map", () => {
      ticker.addCallback(tickFn, 60);

      const previousSize = ticker.callbacks.size;
      ticker.removeCallback(tickFn);
      expect(ticker.callbacks.size).toBeLessThan(previousSize);
      expect(ticker.callbacks.get(tickFn)).toBeUndefined();
    });

    it(".start() should schedule callbacks for execution", async () => {
      const startTickCount = tickCount;
      ticker.addCallback(tickFn, 60);
      ticker.start();

      await new Promise((resolve) => setImmediate(resolve));
      expect(tickCount).toBe(startTickCount + 1);
    });

    it(".pause() should prevent further execution of callbacks", async () => {
      ticker.addCallback(tickFn, 60);
      ticker.start();

      await new Promise((resolve) => setImmediate(resolve));
      const tickCountBeforePause = tickCount;
      ticker.pause();

      await new Promise((resolve) => setImmediate(resolve));
      expect(tickCount).toBe(tickCountBeforePause);
    });

    it("should execute tick callbacks close to their specified tick rate", async () => {
      const startTickCount = tickCount;
      const tps = 60;

      ticker.addCallback(tickFn, tps);
      ticker.start();

      await new Promise((resolve) => {
        let start = Date.now();
        let check = () => (Date.now() - start > 1000 ? resolve(null) : setImmediate(check));
        setImmediate(check);
      });

      expect(1000 / (tickCount - startTickCount)).toBeWithin(1000 / tps - 1, 1000 / tps + 1);
    });
  });

  describe("setImmediate", () => {
    it("executes the callback asynchronously", async () => {
      let executed = false;
      setImmediate(() => (executed = true));
      expect(executed).toBe(false);
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(executed).toBe(true);
    });

    it("passes arguments to the callback", async () => {
      let receivedArgs: unknown[] = [];
      setImmediate(
        (arg1, arg2) => {
          receivedArgs = [arg1, arg2];
        },
        ["hello", 123],
      );

      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(receivedArgs).toEqual(["hello", 123]);
    });

    it("throws error for invalid callback", () => {
      // @ts-expect-error Testing runtime check
      expect(() => setImmediate("not a function")).toThrow(TypeError);
    });

    it("throws error for invalid arguments", () => {
      // @ts-expect-error Testing runtime check
      expect(() => setImmediate(() => {}, "not an array")).toThrow(TypeError);
    });
  });

  describe("clearImmediate", () => {
    it("cancels the execution of the callback", async () => {
      let executed = false;
      const id = setImmediate(() => {
        executed = true;
      });
      clearImmediate(id);

      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(executed).toBe(false);
    });

    it("does nothing if immediate does not exist", () => {
      expect(clearImmediate(999999)).toBe(null);
    });
  });
});
