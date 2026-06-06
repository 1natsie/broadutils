import { describe, expect, it } from "vitest";
import { sleep, time } from "../../src/node/timing/timing.ts";

describe("node/timing time", () => {
  it("runs warmups, averages measured runs, and returns the final result", () => {
    let calls = 0;
    const [duration, result] = time(() => ++calls, 2, 3);

    expect(calls).to.equal(5);
    expect(result).to.equal(5);
    expect(duration).to.be.a("number");
    expect(duration).to.be.at.least(0);
  });
});

describe("node/timing sleep", () => {
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
