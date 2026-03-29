/// <reference types="mocha" />

import { expect } from "chai";
import { min, max, clamp, constrain, convert, average, hcf, lcm } from "../../../math/math.ts";

describe("Math utilities", () => {
  describe("min", () => {
    it("returns the minimum of numbers", () => {
      expect(min(1, 2, 3)).to.equal(1);
      expect(min(5, 3, 8, 1)).to.equal(1);
      expect(min(-1, -2, 0)).to.equal(-2);
    });

    it("returns the minimum of bigints", () => {
      expect(min(1n, 2n, 3n)).to.equal(1n);
      expect(min(5n, 3n, 8n, 1n)).to.equal(1n);
    });

    it("returns the minimum of mixed numbers and bigints", () => {
      expect(min(1, 2n, 3)).to.equal(1);
      expect(min(5n, 3, 8n)).to.equal(3);
    });

    it("throws for non-number/bigint values", () => {
      expect(() => min("1" as any)).to.throw(TypeError);
      expect(() => min({} as any)).to.throw(TypeError);
    });

    it("returns -Infinity for empty array", () => {
      expect(min()).to.equal(Number.NEGATIVE_INFINITY);
    });
  });

  describe("max", () => {
    it("returns the maximum of numbers", () => {
      expect(max(1, 2, 3)).to.equal(3);
      expect(max(5, 3, 8, 1)).to.equal(8);
      expect(max(-1, -2, 0)).to.equal(0);
    });

    it("returns the maximum of bigints", () => {
      expect(max(1n, 2n, 3n)).to.equal(3n);
      expect(max(5n, 3n, 8n, 1n)).to.equal(8n);
    });

    it("returns the maximum of mixed numbers and bigints", () => {
      expect(max(1, 2n, 3)).to.equal(3);
      expect(max(5n, 3, 8n)).to.equal(8n);
    });

    it("throws for non-number/bigint values", () => {
      expect(() => max("1" as any)).to.throw(TypeError);
      expect(() => max({} as any)).to.throw(TypeError);
    });

    it("returns POSITIVE_INFINITY for empty array", () => {
      expect(max()).to.equal(Number.POSITIVE_INFINITY);
    });
  });

  describe("clamp", () => {
    it("clamps numbers within range", () => {
      expect(clamp(5, 0, 10)).to.equal(5);
      expect(clamp(-5, 0, 10)).to.equal(0);
      expect(clamp(15, 0, 10)).to.equal(10);
    });

    it("clamps bigints within range", () => {
      expect(clamp(5n, 0n, 10n)).to.equal(5n);
      expect(clamp(-5n, 0n, 10n)).to.equal(0n);
      expect(clamp(15n, 0n, 10n)).to.equal(10n);
    });
  });

  describe("constrain", () => {
    it("constrains values between 0 and 1", () => {
      expect(constrain(5, 0, 10)).to.equal(0.5);
      expect(constrain(0, 0, 10)).to.equal(0);
      expect(constrain(10, 0, 10)).to.equal(1);
      expect(constrain(-5, 0, 10)).to.equal(0);
      expect(constrain(15, 0, 10)).to.equal(1);
    });
  });

  describe("average", () => {
    it("calculates the average of numbers spread as arguments", () => {
      expect(average(1, 2, 3, 4, 5)).to.equal(3);
      expect(average(10, 20)).to.equal(15);
    });

    it("calculates the average of numbers in an array", () => {
      expect(average([1, 2, 3, 4, 5])).to.equal(3);
      expect(average([10, 20])).to.equal(15);
    });

    it("calculates the average of a single number", () => {
      expect(average(42)).to.equal(42);
    });

    it("returns 0 for empty input", () => {
      expect(average()).to.equal(0);
      expect(average([])).to.equal(0);
    });
  });

  describe("hcf", () => {
    it("calculates the hcf of numbers spread as arguments", () => {
      expect(hcf(18, 72, 69, 42, 15)).to.equal(3);
      expect(hcf(10, 20)).to.equal(10);
    });

    it("calculates the hcf of numbers in an array", () => {
      expect(hcf([18, 72, 69, 42, 15])).to.equal(3);
      expect(hcf([10, 20])).to.equal(10);
    });

    it("calculates the hcf of a single number", () => {
      expect(hcf(42)).to.equal(42);
    });

    it("returns 1 for empty input", () => {
      expect(hcf()).to.equal(1);
      expect(hcf([])).to.equal(1);
    });
  });

  describe("lcm", () => {
    it("calculates the lcm of numbers spread as arguments", () => {
      expect(lcm(1, 2, 3, 4, 5)).to.equal(60);
      expect(lcm(10, 20)).to.equal(20);
    });

    it("calculates the lcm of numbers in an array", () => {
      expect(lcm([1, 2, 3, 4, 5])).to.equal(60);
      expect(lcm([10, 20])).to.equal(20);
    });

    it("calculates the lcm of a single number", () => {
      expect(lcm(42)).to.equal(42);
    });

    it("returns 1 for empty input", () => {
      expect(lcm()).to.equal(1);
      expect(lcm([])).to.equal(1);
    });
  });

  describe("convert", () => {
    describe("angle conversions", () => {
      it("converts degrees to radians", () => {
        expect(convert(180, "degrees", "radians")).to.be.closeTo(Math.PI, 0.000001);
      });

      it("converts radians to degrees", () => {
        expect(convert(Math.PI, "radians", "degrees")).to.be.closeTo(180, 0.000001);
      });

      it("converts degrees to gradians", () => {
        expect(convert(90, "degrees", "gradians")).to.be.closeTo(100, 0.000001);
      });

      it("converts degrees to turns", () => {
        expect(convert(360, "degrees", "turns")).to.equal(1);
      });
    });

    describe("distance conversions", () => {
      it("converts metres to kilometres", () => {
        expect(convert(1000, "metres", "kilometres")).to.equal(1);
      });

      it("converts kilometres to metres", () => {
        expect(convert(1, "kilometres", "metres")).to.equal(1000);
      });

      it("converts metres to millimetres", () => {
        expect(convert(1, "metres", "millimetres")).to.equal(1000);
      });
    });

    describe("mass conversions", () => {
      it("converts grams to kilograms", () => {
        expect(convert(1000, "grams", "kilograms")).to.equal(1);
      });

      it("converts kilograms to grams", () => {
        expect(convert(1, "kilograms", "grams")).to.equal(1000);
      });

      it("converts grams to pounds", () => {
        expect(convert(453.5924, "grams", "pounds")).to.be.closeTo(1, 0.000001);
      });
    });

    describe("time conversions", () => {
      it("converts seconds to minutes", () => {
        expect(convert(60, "seconds", "minutes")).to.equal(1);
      });

      it("converts minutes to seconds", () => {
        expect(convert(1, "minutes", "seconds")).to.equal(60);
      });

      it("converts seconds to hours", () => {
        expect(convert(3600, "seconds", "hours")).to.equal(1);
      });
    });

    it("throws for invalid target unit", () => {
      expect(() => convert(1, "metres", "degrees" as any)).to.throw("Invalid target unit");
    });

    it("throws for unknown source unit", () => {
      expect(() => convert(1, "unknown" as any, "metres")).to.throw("Unknown source unit");
    });
  });
});
