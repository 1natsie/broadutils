import { describe, expect, it } from "vitest";
import {
  average,
  clamp,
  constrain,
  convert,
  hcf,
  lcm,
  max,
  min,
} from "../../src/browser/math/math.ts";

const closeTo = (actual: number, expected: number, delta = 1e-10) => {
  expect(actual).to.be.closeTo(expected, delta);
};

describe("browser/math min and max", () => {
  it("handles numbers, bigints, empty inputs, and invalid values", () => {
    expect(min(3, -1, 2)).to.equal(-1);
    expect(max(3, -1, 2)).to.equal(3);
    expect(min(3n, -1n, 2n)).to.equal(-1n);
    expect(max(3n, -1n, 2n)).to.equal(3n);
    expect(min()).to.equal(Number.NEGATIVE_INFINITY);
    expect(max()).to.equal(Number.POSITIVE_INFINITY);
    expect(() => min(1 as any, "2" as any)).to.throw(TypeError, "Expected number or bigint");
  });
});

describe("browser/math clamp", () => {
  it("constrains values to inclusive bounds", () => {
    expect(clamp(5, 1, 10)).to.equal(5);
    expect(clamp(-1, 1, 10)).to.equal(1);
    expect(clamp(11, 1, 10)).to.equal(10);
    expect(clamp(11n, 1n, 10n)).to.equal(10n);
  });
});

describe("browser/math constrain", () => {
  it("normalizes values into the zero-to-one range", () => {
    expect(constrain(5, 0, 10)).to.equal(0.5);
    expect(constrain(-5, 0, 10)).to.equal(0);
    expect(constrain(15, 0, 10)).to.equal(1);
  });
});

describe("browser/math average", () => {
  it("averages positional values and iterable values", () => {
    expect(average()).to.equal(0);
    expect(average(2, 4, 6)).to.equal(4);
    expect(average([2, 4, 6])).to.equal(4);
    expect(average([])).to.equal(0);
  });
});

describe("browser/math hcf and gcd", () => {
  it("computes highest common factors", () => {
    expect(hcf()).to.equal(1);
    expect(hcf(48)).to.equal(48);
    expect(hcf(48, 18, 30)).to.equal(6);
  });
});

describe("browser/math lcm", () => {
  it("computes lowest common multiples", () => {
    expect(lcm()).to.equal(1);
    expect(lcm(7)).to.equal(7);
    expect(lcm(4, 6, 10)).to.equal(60);
  });
});

describe("browser/math convert", () => {
  it("converts angle, distance, mass, and time units", () => {
    closeTo(convert.degrees.radians(180), Math.PI);
    closeTo(convert.radians.degrees(Math.PI), 180);
    expect(convert.meters).to.equal(convert.metres);
    expect(convert.metres.centimeters(1)).to.equal(100);
    expect(convert.centimeters.meters(100)).to.equal(1);
    expect(convert.grams.milligrams(2)).to.equal(2000);
    expect(convert.pounds.ounces(2)).to.equal(32);
    expect(convert.seconds.milliseconds(2)).to.equal(2000);
    expect(convert.weeks.days(2)).to.equal(14);
  });
});
