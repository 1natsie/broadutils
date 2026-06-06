import { describe, expect, it } from "vitest";
import { assert, check, isNonNullable, nonNullable } from "../../src/browser/validate/validate.ts";

describe("browser/validate check", () => {
  it("checks primitive, object, buffer, regexp, and non-nullish values", () => {
    expect(check.string("x")).to.equal(true);
    expect(check.number(1)).to.equal(true);
    expect(check.number.positive(1)).to.equal(true);
    expect(check.number.negative(-1)).to.equal(true);
    expect(check.number.zero(0)).to.equal(true);
    expect(check.number.integer(1)).to.equal(true);
    expect(check.number.float(1.5)).to.equal(true);
    expect(check.number.finite(Number.POSITIVE_INFINITY)).to.equal(false);
    expect(check.number.safeInteger(Number.MAX_SAFE_INTEGER)).to.equal(true);
    expect(check.boolean(false)).to.equal(true);
    expect(check.true(true)).to.equal(true);
    expect(check.false(false)).to.equal(true);
    expect(check.symbol(Symbol("x"))).to.equal(true);
    expect(check.null(null)).to.equal(true);
    expect(check.undefined(undefined)).to.equal(true);
    expect(check.object({})).to.equal(true);
    expect(check.array([])).to.equal(true);
    expect(check.arraybuffer(new ArrayBuffer(1))).to.equal(true);
    expect(check.arraybufferview(new Uint8Array(1))).to.equal(true);
    expect(check.regexp(/x/)).to.equal(true);
    expect(check.nonNullable(0)).to.equal(true);
  });
});

describe("browser/validate assert", () => {
  it("allows matching values and throws TypeError for mismatches", () => {
    expect(() => assert.string("x")).not.to.throw();
    expect(() => assert.number(1)).not.to.throw();
    expect(() => assert.number.positive(1)).not.to.throw();
    expect(() => assert.number.negative(-1)).not.to.throw();
    expect(() => assert.number.zero(0)).not.to.throw();
    expect(() => assert.number.integer(1)).not.to.throw();
    expect(() => assert.number.float(1.5)).not.to.throw();
    expect(() => assert.number.finite(1)).not.to.throw();
    expect(() => assert.number.safeInteger(1)).not.to.throw();
    expect(() => assert.boolean(false)).not.to.throw();
    expect(() => assert.true(true)).not.to.throw();
    expect(() => assert.false(false)).not.to.throw();
    expect(() => assert.symbol(Symbol("x"))).not.to.throw();
    expect(() => assert.null(null)).not.to.throw();
    expect(() => assert.undefined(undefined)).not.to.throw();
    expect(() => assert.object({})).not.to.throw();
    expect(() => assert.array([])).not.to.throw();
    expect(() => assert.arraybuffer(new ArrayBuffer(1))).not.to.throw();
    expect(() => assert.arraybufferview(new Uint8Array(1))).not.to.throw();
    expect(() => assert.regexp(/x/)).not.to.throw();
    expect(() => assert.nonNullable(0)).not.to.throw();
    expect(() => assert.string(1, "bad string")).to.throw(TypeError, "bad string");
    expect(() => assert.true(false)).to.throw(TypeError, "The provided value is not true");
  });
});

describe("browser/validate isNonNullable", () => {
  it("returns true only for non-nullish values", () => {
    expect(isNonNullable(0)).to.equal(true);
    expect(isNonNullable(null)).to.equal(false);
    expect(isNonNullable(undefined)).to.equal(false);
  });
});

describe("browser/validate nonNullable", () => {
  it("returns values or throws a configured error", () => {
    expect(nonNullable("value")).to.equal("value");
    expect(() => nonNullable(null, "missing")).to.throw(TypeError, "missing");
  });
});
