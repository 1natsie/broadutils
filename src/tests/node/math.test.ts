import { describe, it, expect } from "bun:test";
import { min, max, clamp, constrain, convert, average, lcm, hcf } from "../../math/math.ts";

describe("Math utilities", () => {
  describe("min", () => {
    it("returns the minimum of numbers", () => {
      expect(min(1, 2, 3)).toBe(1);
      expect(min(5, 3, 8, 1)).toBe(1);
      expect(min(-1, -2, 0)).toBe(-2);
    });

    it("returns the minimum of bigints", () => {
      expect(min(1n, 2n, 3n)).toBe(1n);
      expect(min(5n, 3n, 8n, 1n)).toBe(1n);
    });

    it("returns the minimum of mixed numbers and bigints", () => {
      expect(min(1, 2n, 3)).toBe(1);
      expect(min(5n, 3, 8n)).toBe(3);
    });

    it("throws for non-number/bigint values", () => {
      expect(() => min("1" as any)).toThrow(TypeError);
      expect(() => min({} as any)).toThrow(TypeError);
    });

    it("returns -Infinity for empty array", () => {
      expect(min()).toBe(Number.NEGATIVE_INFINITY);
    });
  });

  describe("max", () => {
    it("returns the maximum of numbers", () => {
      expect(max(1, 2, 3)).toBe(3);
      expect(max(5, 3, 8, 1)).toBe(8);
      expect(max(-1, -2, 0)).toBe(0);
    });

    it("returns the maximum of bigints", () => {
      expect(max(1n, 2n, 3n)).toBe(3n);
      expect(max(5n, 3n, 8n, 1n)).toBe(8n);
    });

    it("returns the maximum of mixed numbers and bigints", () => {
      expect(max(1, 2n, 3)).toBe(3);
      expect(max(5n, 3, 8n)).toBe(8n);
    });

    it("throws for non-number/bigint values", () => {
      expect(() => max("1" as any)).toThrow(TypeError);
      expect(() => max({} as any)).toThrow(TypeError);
    });

    it("returns POSITIVE_INFINITY for empty array", () => {
      expect(max()).toBe(Number.POSITIVE_INFINITY);
    });
  });

  describe("clamp", () => {
    it("clamps numbers within range", () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it("clamps bigints within range", () => {
      expect(clamp(5n, 0n, 10n)).toBe(5n);
      expect(clamp(-5n, 0n, 10n)).toBe(0n);
      expect(clamp(15n, 0n, 10n)).toBe(10n);
    });
  });

  describe("constrain", () => {
    it("constrains values between 0 and 1", () => {
      expect(constrain(5, 0, 10)).toBe(0.5);
      expect(constrain(0, 0, 10)).toBe(0);
      expect(constrain(10, 0, 10)).toBe(1);
      expect(constrain(-5, 0, 10)).toBe(0);
      expect(constrain(15, 0, 10)).toBe(1);
    });
  });

  describe("average", () => {
    it("calculates the average of numbers spread as arguments", () => {
      expect(average(1, 2, 3, 4, 5)).toBe(3);
      expect(average(10, 20)).toBe(15);
    });

    it("calculates the average of numbers in an array", () => {
      expect(average([1, 2, 3, 4, 5])).toBe(3);
      expect(average([10, 20])).toBe(15);
    });

    it("calculates the average of a single number", () => {
      expect(average(42)).toBe(42);
    });

    it("returns 0 for empty input", () => {
      expect(average()).toBe(0);
      expect(average([])).toBe(0);
    });
  });

  describe("hcf", () => {
    it("calculates the hcf of numbers spread as arguments", () => {
      expect(hcf(18, 72, 69, 42, 15)).toBe(3);
      expect(hcf(10, 20)).toBe(10);
    });

    it("calculates the hcf of numbers in an array", () => {
      expect(hcf([18, 72, 69, 42, 15])).toBe(3);
      expect(hcf([10, 20])).toBe(10);
    });

    it("calculates the hcf of a single number", () => {
      expect(hcf(42)).toBe(42);
    });

    it("returns 1 for empty input", () => {
      expect(hcf()).toBe(1);
      expect(hcf([])).toBe(1);
    });
  });

  describe("lcm", () => {
    it("calculates the lcm of numbers spread as arguments", () => {
      expect(lcm(1, 2, 3, 4, 5)).toBe(60);
      expect(lcm(10, 20)).toBe(20);
    });

    it("calculates the lcm of numbers in an array", () => {
      expect(lcm([1, 2, 3, 4, 5])).toBe(60);
      expect(lcm([10, 20])).toBe(20);
    });

    it("calculates the lcm of a single number", () => {
      expect(lcm(42)).toBe(42);
    });

    it("returns 1 for empty input", () => {
      expect(lcm()).toBe(1);
      expect(lcm([])).toBe(1);
    });
  });

  describe("convert", () => {
    describe("angle conversions", () => {
      it("converts degrees to radians", () => {
        expect(convert(180, "degrees", "radians")).toBeCloseTo(Math.PI, 10);
      });

      it("converts radians to degrees", () => {
        expect(convert(Math.PI, "radians", "degrees")).toBeCloseTo(180, 10);
      });

      it("converts degrees to gradians", () => {
        expect(convert(90, "degrees", "gradians")).toBeCloseTo(100, 10);
      });

      it("converts degrees to turns", () => {
        expect(convert(360, "degrees", "turns")).toBe(1);
      });
    });

    describe("distance conversions", () => {
      it("converts metres to kilometres", () => {
        expect(convert(1000, "metres", "kilometres")).toBe(1);
      });

      it("converts kilometres to metres", () => {
        expect(convert(1, "kilometres", "metres")).toBe(1000);
      });

      it("converts metres to millimetres", () => {
        expect(convert(1, "metres", "millimetres")).toBe(1000);
      });
    });

    describe("mass conversions", () => {
      it("converts grams to kilograms", () => {
        expect(convert(1000, "grams", "kilograms")).toBe(1);
      });

      it("converts kilograms to grams", () => {
        expect(convert(1, "kilograms", "grams")).toBe(1000);
      });

      it("converts grams to pounds", () => {
        expect(convert(453.5924, "grams", "pounds")).toBeCloseTo(1, 10);
      });
    });

    describe("time conversions", () => {
      it("converts seconds to minutes", () => {
        expect(convert(60, "seconds", "minutes")).toBe(1);
      });

      it("converts minutes to seconds", () => {
        expect(convert(1, "minutes", "seconds")).toBe(60);
      });

      it("converts seconds to hours", () => {
        expect(convert(3600, "seconds", "hours")).toBe(1);
      });
    });

    it("throws for invalid target unit", () => {
      expect(() => convert(1, "metres", "degrees" as any)).toThrow("Invalid target unit");
    });

    it("throws for unknown source unit", () => {
      expect(() => convert(1, "unknown" as any, "metres")).toThrow("Unknown source unit");
    });
  });
});
