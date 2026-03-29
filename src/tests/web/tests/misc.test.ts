/// <reference types="mocha" />

import { expect } from "chai";
import { noop, createDeferred } from "../../../misc/misc.ts";

describe("Misc utilities", () => {
  describe("noop", () => {
    it("returns null regardless of arguments", () => {
      expect(noop()).to.equal(null);
      expect(noop(1, "test", {})).to.equal(null);
    });
  });

  describe("createDeferred", () => {
    it("creates a deferred object", async () => {
      const deferred = await createDeferred<string>();
      expect(deferred).to.have.property("promise");
      expect(deferred).to.have.property("resolve");
      expect(deferred).to.have.property("reject");
      expect(deferred.promise).to.be.instanceOf(Promise);
    });

    it("resolves the promise when resolve is called", async () => {
      const deferred = await createDeferred<number>();
      const result = deferred.promise;
      deferred.resolve(42);
      expect(await result).to.equal(42);
    });

    it("rejects the promise when reject is called", async () => {
      const deferred = await createDeferred<number>();
      const error = new Error("test error");
      deferred.reject(error);
      try {
        await deferred.promise;
        expect.fail("Promise should have rejected");
      } catch (err) {
        expect(err).to.equal(error);
      }
    });
  });
});
