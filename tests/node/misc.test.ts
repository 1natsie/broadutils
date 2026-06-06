import { describe, expect, it } from "vitest";
import { allowGC, createDeferred, noop, preventGC } from "../../src/node/misc/misc.ts";

describe("node/misc noop", () => {
  it("ignores arguments and returns null", () => {
    expect(noop("anything", 1, true)).to.equal(null);
  });
});

describe("node/misc createDeferred", () => {
  it("creates an externally resolvable promise", async () => {
    const deferred = await createDeferred<number>();
    deferred.resolve(42);
    expect(await deferred.promise).to.equal(42);
  });

  it("creates an externally rejectable promise", async () => {
    const deferred = await createDeferred<number>();
    deferred.reject(new Error("nope"));

    try {
      await deferred.promise;
      throw new Error("Expected promise to reject");
    } catch (error) {
      expect((error as Error).message).to.equal("nope");
    }
  });
});

describe("node/misc preventGC and allowGC", () => {
  it("returns null while preserving and releasing references", () => {
    const value = {};
    expect(preventGC(value)).to.equal(null);
    expect(allowGC(value)).to.equal(null);
  });
});
