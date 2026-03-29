import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { allowGC, preventGC, noop, createDeferred, readFileChunks } from "../../misc/misc.ts";

describe("Misc utilities", () => {
  describe("noop", () => {
    it("returns null regardless of arguments", () => {
      expect(noop()).toBe(null);
      expect(noop(1, "test", {})).toBe(null);
    });
  });

  describe("createDeferred", () => {
    it("creates a deferred object", async () => {
      const deferred = await createDeferred<string>();
      expect(deferred).toHaveProperty("promise");
      expect(deferred).toHaveProperty("resolve");
      expect(deferred).toHaveProperty("reject");
      expect(deferred.promise).toBeInstanceOf(Promise);
    });

    it("resolves the promise when resolve is called", async () => {
      const deferred = await createDeferred<number>();
      const result = deferred.promise;
      deferred.resolve(42);
      expect(await result).toBe(42);
    });

    it("rejects the promise when reject is called", async () => {
      const deferred = await createDeferred<number>();
      const error = new Error("test error");
      deferred.reject(error);
      await expect(deferred.promise).rejects.toThrow("test error");
    });
  });

  describe("readFileChunks", () => {
    const testFilePath = "test-chunks.txt";
    const testData = "Hello, world! This is a test for readFileChunks.";

    beforeAll(async () => {
      await Bun.write(testFilePath, testData);
    });

    afterAll(async () => {
      const { unlink } = await import("node:fs/promises");
      try {
        await unlink(testFilePath);
      } catch (e) {}
    });

    it("reads file in chunks", async () => {
      const chunks: Uint8Array[] = [];
      for await (const chunk of readFileChunks(testFilePath, { chunkSize: 10 })) {
        chunks.push(new Uint8Array(chunk));
      }

      expect(chunks.length).toBeGreaterThan(1);
      const combined = new Uint8Array(chunks.reduce((acc, curr) => acc + curr.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }
      expect(new TextDecoder().decode(combined)).toBe(testData);
    });

    it("respects offset and length", async () => {
      const chunks: Uint8Array[] = [];
      for await (const chunk of readFileChunks(testFilePath, { offset: 7, length: 5 })) {
        chunks.push(new Uint8Array(chunk));
      }

      const combined = new Uint8Array(chunks.reduce((acc, curr) => acc + curr.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }
      expect(new TextDecoder().decode(combined)).toBe("world");
    });

    it("throws RangeError for invalid offset", async () => {
      const generator = readFileChunks(testFilePath, { offset: 1000 });
      await expect(generator.next()).rejects.toThrow(RangeError);
    });
  });

  describe("garbage collection utilities", () => {
    const ref = new WeakRef({ booleanValue: true });
    const obj = { value: ref.deref() };

    describe("preventGC", () => {
      it("prevents an object-based value from being garbage collected", () => {
        if (!obj.value) throw new ReferenceError("Test value was pre-emptively garbage-collected.");
        preventGC(obj.value);
        delete obj.value;
        Bun.gc(true);
        expect(ref.deref()).not.toBe(undefined);
      });
    });
    describe("allowGC", () => {
      it("allows an object-based value to be garbage-collected", () => {
        allowGC(
          ((v) => {
            if (v != null) return v;
            throw new ReferenceError("Test value was pre-emptively garbage-collected.");
          })(ref.deref()),
        );

        Bun.gc(true);
        expect(ref.deref()).toBe(undefined);
      });
    });
  });
});
