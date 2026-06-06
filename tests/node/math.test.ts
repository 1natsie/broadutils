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
} from "../../src/node/math/math.ts";

const closeTo = (actual: number, expected: number, delta = 1e-10) => {
  expect(actual).to.be.closeTo(expected, delta);
};

describe("node/math min and max", () => {
  it("handles numbers, bigints, empty inputs, and invalid values", () => {
    expect(min(3, -1, 2)).to.equal(-1);
    expect(max(3, -1, 2)).to.equal(3);
    expect(min(3n, -1n, 2n)).to.equal(-1n);
    expect(max(3n, -1n, 2n)).to.equal(3n);
    expect(min()).to.equal(Number.NEGATIVE_INFINITY);
    expect(max()).to.equal(Number.POSITIVE_INFINITY);
    expect(() => min(1 as any, "2" as any)).to.throw(TypeError, "Expected number or bigint");
    expect(() => max(1 as any, "2" as any)).to.throw(TypeError, "Expected number or bigint");
  });
});

describe("node/math clamp", () => {
  it("constrains values to inclusive bounds", () => {
    expect(clamp(5, 1, 10)).to.equal(5);
    expect(clamp(-1, 1, 10)).to.equal(1);
    expect(clamp(11, 1, 10)).to.equal(10);
    expect(clamp(11n, 1n, 10n)).to.equal(10n);
  });
});

describe("node/math constrain", () => {
  it("normalizes values into the zero-to-one range", () => {
    expect(constrain(5, 0, 10)).to.equal(0.5);
    expect(constrain(-5, 0, 10)).to.equal(0);
    expect(constrain(15, 0, 10)).to.equal(1);
  });
});

describe("node/math average", () => {
  it("averages positional values and iterable values", () => {
    expect(average()).to.equal(0);
    expect(average(2, 4, 6)).to.equal(4);
    expect(average([2, 4, 6])).to.equal(4);
    expect(average([])).to.equal(0);
  });
});

describe("node/math hcf and gcd", () => {
  it("computes highest common factors", () => {
    expect(hcf()).to.equal(1);
    expect(hcf(48)).to.equal(48);
    expect(hcf(48, 18, 30)).to.equal(6);
    expect(hcf([48, 18, 30])).to.equal(6);
  });
});

describe("node/math lcm", () => {
  it("computes lowest common multiples", () => {
    expect(lcm()).to.equal(1);
    expect(lcm(7)).to.equal(7);
    expect(lcm(4, 6, 10)).to.equal(60);
    expect(lcm([4, 6, 10])).to.equal(60);
  });
});

describe("node/math convert", () => {
  it("converts angle units", () => {
    closeTo(convert.degrees.radians(180), Math.PI);
    closeTo(convert.radians.degrees(Math.PI), 180);
    expect(convert.turns.degrees(0.5)).to.equal(180);
    expect(convert.gradians.turns(200)).to.equal(0.5);
  });

  it("converts distance units and exposes metre/meter aliases", () => {
    expect(convert.meters).to.equal(convert.metres);
    expect(convert.kilometers).to.equal(convert.kilometres);
    expect(convert.metres.centimeters(1)).to.equal(100);
    expect(convert.meters.centimeters(1)).to.equal(100);
    expect(convert.centimeters.meters(100)).to.equal(1);
    expect(convert.kilometres.metres(2)).to.equal(2000);
    expect(convert.nanometres.micrometers(1000)).to.equal(1);
  });

  it("converts mass units", () => {
    expect(convert.grams.milligrams(2)).to.equal(2000);
    expect(convert.kilograms.grams(2)).to.equal(2000);
    expect(convert.tonnes.kilograms(2)).to.equal(2000);
    expect(convert.pounds.ounces(2)).to.equal(32);
    expect(convert.ounces.pounds(32)).to.equal(2);
    closeTo(convert.grams.pounds(1000), 2.204623);
  });

  it("converts time units", () => {
    expect(convert.seconds.milliseconds(2)).to.equal(2000);
    expect(convert.minutes.seconds(2)).to.equal(120);
    expect(convert.hours.minutes(2)).to.equal(120);
    expect(convert.days.hours(2)).to.equal(48);
    expect(convert.weeks.days(2)).to.equal(14);
    expect(convert.nanoseconds.microseconds(1000)).to.equal(1);
  });
});
