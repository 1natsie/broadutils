import { describe, expect, it } from "vitest";
import { clearImmediate, setImmediate, sleep, time } from "../../src/browser/timing/timing.ts";

const nextTask = () => new Promise((resolve) => setTimeout(resolve, 10));

describe("browser/timing time", () => {
  it("runs warmups, averages measured runs, and returns the final result", () => {
    let calls = 0;
    const [duration, result] = time(() => ++calls, 2, 3);

    expect(calls).to.equal(5);
    expect(result).to.equal(5);
    expect(duration).to.be.a("number");
    expect(duration).to.be.at.least(0);
  });
});

describe("browser/timing sleep", () => {
  it("sleeps for the specified duration", async () => {
    const start = Date.now();
    await sleep(100);
    expect(Date.now() - start).to.be.at.least(100);
  });

  it("resolves with the actual duration slept", async () => {
    const duration = await sleep(100);
    expect(duration).to.be.a("number");
    expect(duration).to.be.at.least(100);
  });

  it("resolves immediately if duration is zero or negative", async () => {
    const start = Date.now();
    await sleep(0);
    expect(Date.now() - start).to.be.lessThan(50);
    await sleep(-100);
    expect(Date.now() - start).to.be.lessThan(50);
  });

  it("resolves immediately if duration is greater than 2 ** 31 - 1", async () => {
    const start = Date.now();
    await sleep(2 ** 31);
    expect(Date.now() - start).to.be.lessThan(50);
  });

  describe("sync", () => {
    it("sleeps for the specified duration", async () => {
      const start = Date.now();
      sleep.sync(100);
      expect(Date.now() - start).to.be.at.least(100);
    });

    it("resolves with the actual duration slept", async () => {
      const duration = sleep.sync(100);
      expect(duration).to.be.a("number");
      expect(duration).to.be.at.least(100);
    });

    it("resolves immediately if duration is zero or negative", async () => {
      const start = Date.now();
      sleep.sync(0);
      expect(Date.now() - start).to.be.lessThan(50);
      sleep.sync(-100);
      expect(Date.now() - start).to.be.lessThan(50);
    });

    it("resolves immediately if duration is greater than 2 ** 31 - 1", async () => {
      const start = Date.now();
      sleep.sync(2 ** 31);
      expect(Date.now() - start).to.be.lessThan(50);
    });
  });
});

describe("browser/timing setImmediate and clearImmediate", () => {
  it("runs queued callbacks with arguments", async () => {
    const values: unknown[] = [];
    const id = setImmediate((a, b) => values.push(a, b), ["a", "b"]);

    expect(id).to.be.a("number");
    await nextTask();
    expect(values).to.deep.equal(["a", "b"]);
  });

  it("cancels queued callbacks and validates inputs", async () => {
    const values: unknown[] = [];
    const id = setImmediate(() => values.push("ran"));
    expect(clearImmediate(id)).to.equal(null);
    await nextTask();
    expect(values).to.deep.equal([]);
    expect(clearImmediate(9999)).to.equal(null);
    expect(() => setImmediate("bad" as any)).to.throw(TypeError, "Invalid callback.");
    expect(() => setImmediate(() => null, "bad" as any)).to.throw(
      TypeError,
      "Invalid callback arguments.",
    );
  });
});
