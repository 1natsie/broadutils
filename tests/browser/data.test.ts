import { beforeEach, describe, expect, it } from "vitest";
import {
  array,
  clone,
  convertToDataUrl,
  object,
  string,
  textDecoder,
  textEncoder,
} from "../../src/browser/data/data.ts";
import { installFileReaderMock } from "./browser-apis.ts";

describe("browser/data textEncoder", () => {
  it("encodes strings as utf-8 bytes", () => {
    expect([...textEncoder.encode("Hi")]).to.deep.equal([72, 105]);
  });
});

describe("browser/data textDecoder", () => {
  it("decodes utf-8 bytes into strings", () => {
    expect(textDecoder.decode(new Uint8Array([72, 105]))).to.equal("Hi");
  });
});

describe("browser/data convertToDataUrl", () => {
  beforeEach(() => {
    installFileReaderMock();
  });

  it("converts a single source to a data URL", async () => {
    expect(await convertToDataUrl(new Uint8Array([72, 105]), "text/plain")).to.equal(
      "data:text/plain;base64,SGk=",
    );
  });

  it("converts Blob sources and source arrays", async () => {
    expect(
      await convertToDataUrl(new Blob([new Uint8Array([72])], { type: "text/plain" })),
    ).to.equal("data:text/plain;base64,SA==");

    expect(
      await convertToDataUrl([new Uint8Array([72]), new Uint8Array([105])], "text/plain"),
    ).to.equal("data:text/plain;base64,SGk=");
  });
});

describe("browser/data array", () => {
  it("appends, prepends, compares, pads, and reverses arrays", () => {
    const target = [2, 3];
    expect(array.append(target, [4], [5])).to.equal(target);
    expect(array.prepend(target, [0, 1])).to.equal(target);
    expect(target).to.deep.equal([0, 1, 2, 3, 4, 5]);
    expect(array.compare([1], [1, 2])).to.equal(-1);
    expect(array.compare([[1, 2]], [[1, 3]])).to.equal(-1);
    expect(array.compare(["same"], ["same"])).to.equal(0);
    expect(array.padStart([2], 3, 1)).to.deep.equal([1, 1, 2]);
    expect(array.padEnd([2], 3, 1)).to.deep.equal([2, 1, 1]);
    expect(array.toReversed([1, 2, 3])).to.deep.equal([3, 2, 1]);
  });
});

describe("browser/data clone", () => {
  it("deep-clones common object graphs", () => {
    const source: any = { nested: { value: 1 }, list: [{ value: 2 }] };
    source.self = source;
    source.set = new Set([source.nested]);

    const result = clone(source);
    expect(result).to.not.equal(source);
    expect(result.nested).to.not.equal(source.nested);
    expect(result.list[0]).to.not.equal(source.list[0]);
    expect(result.self).to.equal(result);
    expect([...result.set][0]).to.deep.equal({ value: 1 });
  });
});

describe("browser/data object", () => {
  it("freezes, merges, omits, and picks properties", () => {
    const value: any = { nested: { count: 1 } };
    value.self = value;
    object.deepFreeze(value);
    expect(Object.isFrozen(value)).to.equal(true);
    expect(Object.isFrozen(value.nested)).to.equal(true);

    const target = { a: 1 };
    expect(object.merge(target, { b: 2 })).to.deep.equal({ a: 1, b: 2 });
    expect(object.mergeInto(target, { b: 2 })).to.equal(target);
    expect(object.omit({ a: 1, b: 2 }, ["b"])).to.deep.equal({ a: 1 });
    expect(object.pick({ a: 1, b: 2 }, ["b"])).to.deep.equal({ b: 2 });
  });
});

describe("browser/data string", () => {
  it("reverses and substitutes strings", () => {
    expect(string.reverse("desserts")).to.equal("stressed");
    expect(string.substitute("one two one", { one: "1", two: "2" })).to.equal("1 2 1");
    expect(string.substitute("abc abc", new Map([[/abc/g, "x"]]))).to.equal("x x");
  });
});
