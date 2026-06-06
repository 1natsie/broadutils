import { describe, expect, it } from "vitest";
import {
  array,
  base64,
  clone,
  convertToDataUrl,
  object,
  string,
  textDecoder,
  textEncoder,
} from "../../src/node/data/data.ts";

describe("node/data textEncoder", () => {
  it("encodes strings as utf-8 bytes", () => {
    expect([...textEncoder.encode("Hi")]).to.deep.equal([72, 105]);
  });
});

describe("node/data textDecoder", () => {
  it("decodes utf-8 bytes into strings", () => {
    expect(textDecoder.decode(new Uint8Array([72, 105]))).to.equal("Hi");
  });
});

describe("node/data base64", () => {
  it("encodes and decodes strings and byte views", () => {
    expect(base64.encode("Hello?")).to.equal("SGVsbG8/");
    expect(textDecoder.decode(base64.decode("SGVsbG8/"))).to.equal("Hello?");

    const bytes = new Uint8Array([0, 72, 105, 255]);
    expect(base64.encode(bytes.subarray(1, 3))).to.equal("SGk=");
    expect([...base64.decode("SGk=")]).to.deep.equal([72, 105]);
  });

  it("supports the url-safe alphabet", () => {
    expect(base64.encode(new Uint8Array([251, 255]), true)).to.equal("-_8=");
    expect([...base64.decode("-_8=", true)]).to.deep.equal([251, 255]);
  });

  it("can decode data with non-alphabet characters in non-strict mode", () => {
    expect(textDecoder.decode(base64.decodeNonStrict("S G\nV\tsbG8="))).to.equal("Hello");
  });
});

describe("node/data convertToDataUrl", () => {
  it("converts binary sources to data URLs", async () => {
    const dataUrl = await convertToDataUrl(new Uint8Array([72, 105]), "text/plain");
    expect(dataUrl).to.equal("data:text/plain;base64,SGk=");
  });

  it("concatenates multiple sources before encoding", async () => {
    const dataUrl = await convertToDataUrl([
      new Uint8Array([72]),
      new Blob([new Uint8Array([105])]),
      new Uint8Array([33]).buffer,
    ]);

    expect(dataUrl).to.equal("data;base64,SGkh");
  });
});

describe("node/data array", () => {
  it("appends and prepends sources in place", () => {
    const target = [2, 3];
    expect(array.append(target, [4], [5, 6])).to.equal(target);
    expect(target).to.deep.equal([2, 3, 4, 5, 6]);

    expect(array.prepend(target, [0, 1])).to.equal(target);
    expect(target).to.deep.equal([0, 1, 2, 3, 4, 5, 6]);
  });

  it("compares arrays by length, nested values, and custom comparators", () => {
    expect(array.compare([1], [1, 2])).to.equal(-1);
    expect(array.compare([2], [1])).to.equal(1);
    expect(array.compare([[1, 2]], [[1, 3]])).to.equal(-1);
    expect(array.compare(["b"], ["a"], (a, b) => b.localeCompare(a))).to.equal(-1);
    expect(array.compare(["same"], ["same"])).to.equal(0);
  });

  it("pads and reverses arrays without surprising mutation", () => {
    const value = [2];
    expect(array.padStart(value, 3, 1)).to.equal(value);
    expect(value).to.deep.equal([1, 1, 2]);
    expect(array.padEnd(value, 5, 3)).to.deep.equal([1, 1, 2, 3, 3]);
    expect(array.toReversed(value)).to.deep.equal([3, 3, 2, 1, 1]);
    expect(value).to.deep.equal([1, 1, 2, 3, 3]);
  });
});

describe("node/data clone", () => {
  it("deep-clones arrays, plain objects, and sets while preserving cycles", () => {
    const source: any = { nested: { value: 1 }, list: [{ value: 2 }] };
    source.self = source;
    source.set = new Set([source.nested]);

    const result = clone(source);

    expect(result).to.not.equal(source);
    expect(result.nested).to.deep.equal({ value: 1 });
    expect(result.nested).to.not.equal(source.nested);
    expect(result.list[0]).to.deep.equal({ value: 2 });
    expect(result.list[0]).to.not.equal(source.list[0]);
    expect(result.self).to.equal(result);
    expect([...result.set][0]).to.deep.equal({ value: 1 });
    expect([...result.set][0]).to.not.equal(source.nested);
  });

  it("returns primitives unchanged and copies maps", () => {
    const map = new Map([["key", { value: 1 }]]);
    const result = clone(map);

    expect(clone(null)).to.equal(null);
    expect(clone("value")).to.equal("value");
    expect(result).to.not.equal(map);
    expect([...result.entries()]).to.deep.equal([...map.entries()]);
  });
});

describe("node/data object", () => {
  it("deep-freezes nested object graphs with cycles", () => {
    const value: any = { nested: { count: 1 }, list: [{ count: 2 }] };
    value.self = value;

    expect(object.deepFreeze(value)).to.equal(value);
    expect(Object.isFrozen(value)).to.equal(true);
    expect(Object.isFrozen(value.nested)).to.equal(true);
    expect(Object.isFrozen(value.list)).to.equal(true);
    expect(Object.isFrozen(value.list[0])).to.equal(true);
  });

  it("merges, mutates into a target, omits, and picks properties", () => {
    const first = { a: 1 };
    const merged = object.merge(first, { b: 2 }, null, undefined);
    expect(merged).to.deep.equal({ a: 1, b: 2 });
    expect(merged).to.not.equal(first);

    expect(object.mergeInto(first, { b: 2 })).to.equal(first);
    expect(first).to.deep.equal({ a: 1, b: 2 });
    expect(object.omit({ a: 1, b: 2, c: 3 }, ["b"])).to.deep.equal({ a: 1, c: 3 });
    expect(object.pick({ a: 1, b: 2, c: 3 }, ["a", "c"])).to.deep.equal({ a: 1, c: 3 });
  });
});

describe("node/data string", () => {
  it("reverses strings", () => {
    expect(string.reverse("desserts")).to.equal("stressed");
  });

  it("substitutes records, string maps, and regular-expression maps", () => {
    expect(string.substitute("one two one", { one: "1", two: "2" })).to.equal("1 2 1");
    expect(
      string.substitute(
        "abc abc",
        new Map<string | RegExp, string>([
          ["abc", "x"],
          [/\sx$/, " y"],
        ]),
      ),
    ).to.equal("x y");
  });
});
