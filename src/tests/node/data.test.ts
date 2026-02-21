import { describe, it, expect } from "bun:test";
import { array, clone, convertToDataUrl, object, string } from "../../data/data.ts";

// Mock FileReader for Node environment
global.FileReader = class MockFileReader {
  onloadend: any = null;
  onerror: any = null;
  result: string = "data:text/plain;base64,dGVzdA=="; // Mock result

  readAsDataURL() {
    // Simulate successful read
    setTimeout(() => {
      if (this.onloadend) {
        this.onloadend({ target: { result: this.result } });
      }
    }, 0);
  }
} as any;

describe("clone", () => {
  it("clones primitives", () => {
    expect(clone(1)).toBe(1);
    expect(clone("a")).toBe("a");
    expect(clone(null)).toBe(null);
    expect(clone(undefined)).toBe(undefined);
  });

  it("clones a simple object", () => {
    const obj = { a: 1, b: "test" };
    const cloned = clone(obj);
    expect(cloned).toEqual(obj);
    expect(cloned).not.toBe(obj);
  });

  it("clones a nested object", () => {
    const obj = { a: 1, b: { c: 2 } };
    const cloned = clone(obj);
    expect(cloned).toEqual(obj);
    expect(cloned.b).not.toBe(obj.b);
  });

  it("clones an array", () => {
    const arr = [1, { a: 2 }];
    const cloned = clone(arr);
    expect(cloned).toEqual(arr);
    expect(cloned).not.toBe(arr);
    expect(cloned[1]).not.toBe(arr[1]);
  });

  it("clones Map and Set", () => {
    const map = new Map([["a", 1]]);
    const set = new Set([1, 2]);
    const obj = { map, set };
    const cloned = clone(obj);
    expect(cloned.map).toEqual(map);
    expect(cloned.map).not.toBe(map);
    expect(cloned.set).toEqual(set);
    expect(cloned.set).not.toBe(set);
  });

  it("handles circular references", () => {
    const obj: any = { a: 1 };
    obj.self = obj;
    const cloned = clone(obj);
    expect(cloned.a).toBe(1);
    expect(cloned.self).toBe(cloned);
    expect(cloned).not.toBe(obj);
  });
});

describe("convertToDataUrl", () => {
  it("converts a Blob to data URL", async () => {
    const blob = new Blob(["test"], { type: "text/plain" });
    const dataUrl = await convertToDataUrl(blob);
    expect(dataUrl).toStartWith("data:text/plain;base64,");
  });

  it("converts an ArrayBuffer to data URL", async () => {
    const buffer = new ArrayBuffer(4);
    const view = new Uint8Array(buffer);
    view.set([72, 101, 108, 108]); // "Hell"
    const dataUrl = await convertToDataUrl(buffer);
    expect(dataUrl).toStartWith("data:");
  });

  it("converts an ArrayBufferView to data URL", async () => {
    const view = new Uint8Array([72, 101, 108, 108]);
    const dataUrl = await convertToDataUrl(view);
    expect(dataUrl).toStartWith("data:");
  });

  it("converts with custom mimeType", async () => {
    const blob = new Blob(["test"]);
    const dataUrl = await convertToDataUrl(blob, "text/plain");
    expect(dataUrl).toStartWith("data:text/plain;base64,");
  });

  it("converts array of sources", async () => {
    const sources = [new Uint8Array([72]), new Uint8Array([101])];
    const dataUrl = await convertToDataUrl(sources);
    expect(dataUrl).toStartWith("data:");
  });
});

describe("array", () => {
  describe("append", () => {
    it("appends elements from source arrays to target", () => {
      const target = [1, 2];
      const source1 = [3, 4];
      const source2 = [5, 6];
      const result = array.append(target, source1, source2);
      expect(result).toBe(target); // Should mutate and return target
      expect(result).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it("appends mixed types", () => {
      const target: (number | string)[] = [1];
      const source = ["a", "b"];
      const result = array.append(target, source);
      expect(result).toEqual([1, "a", "b"]);
    });

    it("handles empty sources", () => {
      const target = [1];
      const result = array.append(target, [], [2]);
      expect(result).toEqual([1, 2]);
    });
  });

  describe("prepend", () => {
    it("prepends elements from source arrays to target", () => {
      const target = [1, 2];
      const source1 = [3, 4];
      const source2 = [5, 6];
      const result = array.prepend(target, source1, source2);
      expect(result).toBe(target); // Should mutate and return target
      expect(result).toEqual([3, 4, 5, 6, 1, 2]);
    });

    it("prepends mixed types", () => {
      const target: (number | string)[] = [1];
      const source = ["a", "b"];
      const result = array.prepend(target, source);
      expect(result).toEqual(["a", "b", 1]);
    });

    it("handles empty sources", () => {
      const target = [1];
      const result = array.prepend(target, [], [2]);
      expect(result).toEqual([2, 1]);
    });
  });

  describe("compare", () => {
    it("returns 0 for identical number arrays", () => {
      expect(array.compare([1, 2, 3], [1, 2, 3])).toBe(0);
    });

    it("returns 0 for identical string arrays", () => {
      expect(array.compare(["a", "b"], ["a", "b"])).toBe(0);
    });

    it("returns -1 if first array is shorter", () => {
      expect(array.compare([1, 2], [1, 2, 3])).toBe(-1);
    });

    it("returns 1 if first array is longer", () => {
      expect(array.compare([1, 2, 3], [1, 2])).toBe(1);
    });

    it("returns -1 if first array has smaller element", () => {
      expect(array.compare([1, 2], [1, 3])).toBe(-1);
    });

    it("returns 1 if first array has larger element", () => {
      expect(array.compare([1, 3], [1, 2])).toBe(1);
    });

    it("compares nested arrays recursively", () => {
      expect(array.compare([[1], [2]], [[1], [2]])).toBe(0);
      expect(array.compare([[1], [2]], [[1], [3]])).toBe(-1);
    });

    it("uses custom compare function", () => {
      const compareFn = (a: { val: number }, b: { val: number }) => {
        return a.val === b.val ? 0 : a.val < b.val ? -1 : 1;
      };
      expect(array.compare([{ val: 1 }], [{ val: 1 }], compareFn)).toBe(0);
      expect(array.compare([{ val: 1 }], [{ val: 2 }], compareFn)).toBe(-1);
    });
  });

  describe("padStart", () => {
    it("pads array start with value", () => {
      const arr = [1, 2];
      const result = array.padStart(arr, 4, 0);
      expect(result).toBe(arr); // Should mutate
      expect(result).toEqual([0, 0, 1, 2]);
    });

    it("uses 0 as default pad value", () => {
      const arr = [1];
      array.padStart(arr, 2);
      expect(arr).toEqual([0, 1]);
    });

    it("does nothing if length is already sufficient", () => {
      const arr = [1, 2];
      array.padStart(arr, 1);
      expect(arr).toEqual([1, 2]);
    });
  });

  describe("padEnd", () => {
    it("pads array end with value", () => {
      const arr = [1, 2];
      const result = array.padEnd(arr, 4, 0);
      expect(result).toBe(arr); // Should mutate
      expect(result).toEqual([1, 2, 0, 0]);
    });

    it("uses 0 as default pad value", () => {
      const arr = [1];
      array.padEnd(arr, 2);
      expect(arr).toEqual([1, 0]);
    });

    it("does nothing if length is already sufficient", () => {
      const arr = [1, 2];
      array.padEnd(arr, 1);
      expect(arr).toEqual([1, 2]);
    });
  });

  describe("toReversed", () => {
    it("returns a new reversed array", () => {
      const arr = [1, 2, 3];
      const result = array.toReversed(arr);
      expect(result).toEqual([3, 2, 1]);
      expect(result).not.toBe(arr); // Should not be the same reference
      expect(arr).toEqual([1, 2, 3]); // Should not mutate original
    });

    it("handles empty array", () => {
      const result = array.toReversed([]);
      expect(result).toEqual([]);
    });
  });
});

describe("object", () => {
  describe("deepFreeze", () => {
    it("freezes a simple object", () => {
      const obj = { a: 1 };
      const frozen = object.deepFreeze(obj);
      expect(frozen).toBe(obj);
      expect(Object.isFrozen(frozen)).toBe(true);
    });

    it("freezes nested objects", () => {
      const obj = { a: { b: 1 } };
      object.deepFreeze(obj);
      expect(Object.isFrozen(obj)).toBe(true);
      expect(Object.isFrozen(obj.a)).toBe(true);
    });

    it("freezes arrays", () => {
      const arr = [{ a: 1 }];
      object.deepFreeze(arr);
      expect(Object.isFrozen(arr)).toBe(true);
      expect(Object.isFrozen(arr[0])).toBe(true);
    });

    it("handles circular references", () => {
      const obj: any = { a: 1 };
      obj.self = obj;
      expect(() => object.deepFreeze(obj)).not.toThrow();
      expect(Object.isFrozen(obj)).toBe(true);
    });

    it("prevents modification", () => {
      const obj = { a: 1 };
      object.deepFreeze(obj);
      try {
        (obj as any).a = 2;
      } catch (e) {
        // Strict mode might throw
      }
      expect(obj.a).toBe(1);
    });
  });

  describe("merge", () => {
    it("merges multiple objects", () => {
      const result = object.merge({ a: 1 }, { b: 2 }, { c: 3 });
      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it("later objects override earlier ones", () => {
      const result = object.merge({ a: 1 }, { a: 2 });
      expect(result).toEqual({ a: 2 });
    });

    it("handles undefined sources", () => {
      const result = object.merge({ a: 1 }, undefined, { b: 2 });
      expect(result).toEqual({ a: 1, b: 2 });
    });
  });

  describe("mergeInto", () => {
    it("merges into the first object", () => {
      const target = { a: 1 };
      const result = object.mergeInto(target, { b: 2 }, { c: 3 });
      expect(result).toBe(target as typeof result);
      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it("overrides properties in target", () => {
      const target = { a: 1, b: 2 };
      object.mergeInto(target, { b: 3 });
      expect(target).toEqual({ a: 1, b: 3 });
    });
  });

  describe("omit", () => {
    it("omits specified keys", () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = object.omit(obj, ["b"]);
      expect(result).toEqual({ a: 1, c: 3 });
    });

    it("omits multiple keys", () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const result = object.omit(obj, ["a", "c"]);
      expect(result).toEqual({ b: 2, d: 4 });
    });

    it("returns original object if no keys to omit", () => {
      const obj = { a: 1, b: 2 };
      const result = object.omit(obj, []);
      expect(result).toEqual(obj);
    });

    it("handles non-existent keys", () => {
      const obj = { a: 1, b: 2 };
      const result = object.omit(obj, ["c" as any]);
      expect(result).toEqual({ a: 1, b: 2 });
    });
  });

  describe("pick", () => {
    it("picks specified keys", () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = object.pick(obj, ["a", "c"]);
      expect(result).toEqual({ a: 1, c: 3 });
    });

    it("picks single key", () => {
      const obj = { a: 1, b: 2 };
      const result = object.pick(obj, ["b"]);
      expect(result).toEqual({ b: 2 });
    });

    it("returns empty object if no keys", () => {
      const obj = { a: 1, b: 2 };
      const result = object.pick(obj, []);
      expect(result).toEqual({});
    });
  });

  describe("walk", () => {
    const testObj = { a: 1, b: { c: 2 }, d: [3, { e: 4 }] };

    it("walks an object in pre-order (default)", () => {
      const walker = object.walk(testObj);
      const keys = [...walker].map((item) => item.key);
      expect(keys).toEqual([null, "a", "b", null, "c", "d", null, "0", "1", null, "e"]);
    });

    it("walks an object in post-order (leafPriority)", () => {
      const walker = object.walk(testObj, { leafPriority: true });
      const values = [...walker].map((item) => item.value);
      expect(values).toEqual([
        1,
        2,
        { c: 2 },
        3,
        4,
        { e: 4 },
        [3, { e: 4 }],
        { a: 1, b: { c: 2 }, d: [3, { e: 4 }] },
      ]);
    });

    it("calls callback for each item", () => {
      const called: any[] = [];
      const walker = object.walk(testObj, null, (details) => called.push(details.key));
      [...walker]; // consume the iterator
      expect(called).toEqual([null, "a", "b", null, "c", "d", null, "0", "1", null, "e"]);
    });
  });
});

describe("string", () => {
  describe("reverse", () => {
    it("reverses a string", () => {
      expect(string.reverse("hello")).toBe("olleh");
    });

    it("reverses empty string", () => {
      expect(string.reverse("")).toBe("");
    });

    it("reverses single character", () => {
      expect(string.reverse("a")).toBe("a");
    });
  });

  describe("substitute", () => {
    it("substitutes with Map", () => {
      const map = new Map([
        ["a", "x"],
        ["b", "y"],
      ]);
      expect(string.substitute("abc", map)).toBe("xyc");
    });

    it("substitutes with Record", () => {
      const record = { a: "x", b: "y" };
      expect(string.substitute("abc", record)).toBe("xyc");
    });

    it("substitutes with RegExp", () => {
      const map = new Map([[new RegExp("\\d+", "g"), "num"]]);
      expect(string.substitute("a1b2", map)).toBe("anumbnum");
    });

    it("handles no matches", () => {
      const record = { x: "y" };
      expect(string.substitute("abc", record)).toBe("abc");
    });
  });
});
