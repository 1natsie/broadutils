/// <reference types="mocha" />

import { expect } from "chai";
import { clearImmediate, setImmediate, ticker } from "../../../timing/timing.ts";

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
      expect(ticker.callbacks.size).to.be.greaterThan(previousSize);
      expect(typeof ticker.callbacks.get(tickFn)).to.equal("object");
    });

    it(".removeCallback() should remove a callback from the callbacks map", () => {
      ticker.addCallback(tickFn, 60);

      const previousSize = ticker.callbacks.size;
      ticker.removeCallback(tickFn);
      expect(ticker.callbacks.size).to.be.lessThan(previousSize);
      expect(typeof ticker.callbacks.get(tickFn)).to.equal("undefined");
    });

    it(".start() should schedule callbacks for execution", async () => {
      const startTickCount = tickCount;
      ticker.addCallback(tickFn, 60);
      ticker.start();

      await new Promise((resolve) => setImmediate(resolve));
      expect(tickCount).to.equal(startTickCount + 1);
    });

    it(".pause() should prevent further execution of callbacks", async () => {
      ticker.addCallback(tickFn, 60);
      ticker.start();

      await new Promise((resolve) => setImmediate(resolve));
      const tickCountBeforePause = tickCount;
      ticker.pause();

      await new Promise((resolve) => setImmediate(resolve));
      expect(tickCount).to.equal(tickCountBeforePause);
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

      expect(1000 / (tickCount - startTickCount)).to.be.within(1000 / tps - 1, 1000 / tps + 1);
    });
  });

  describe("setImmediate", () => {
    it("executes the callback asynchronously", async () => {
      let executed = false;
      setImmediate(() => (executed = true));
      expect(executed).to.equal(false);
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(executed).to.equal(true);
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
      expect(receivedArgs).to.deep.equal(["hello", 123]);
    });

    it("throws error for invalid callback", () => {
      // @ts-expect-error Testing runtime check
      expect(() => setImmediate("not a function")).to.throw(TypeError);
    });

    it("throws error for invalid arguments", () => {
      // @ts-expect-error Testing runtime check
      expect(() => setImmediate(() => {}, "not an array")).to.throw(TypeError);
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
      expect(executed).to.equal(false);
    });

    it("does nothing if immediate does not exist", () => {
      expect(clearImmediate(999999)).to.equal(null);
    });
  });
});
