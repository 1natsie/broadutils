import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { noop, createDeferred, setImmediate, clearImmediate, readFileChunks } from "../../misc/misc.ts";

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

  describe("setImmediate", () => {
    it("executes the callback asynchronously", async () => {
      let executed = false;
      setImmediate(() => {
        executed = true;
      });
      expect(executed).toBe(false);
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(executed).toBe(true);
    });

    it("passes arguments to the callback", async () => {
      let receivedArgs: unknown[] = [];
      setImmediate(
        (arg1, arg2) => {
          receivedArgs = [arg1, arg2];
        },
        ["hello", 123],
      );

      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(receivedArgs).toEqual(["hello", 123]);
    });

    it("throws error for invalid callback", () => {
      // @ts-expect-error Testing runtime check
      expect(() => setImmediate("not a function")).toThrow(TypeError);
    });

    it("throws error for invalid arguments", () => {
      // @ts-expect-error Testing runtime check
      expect(() => setImmediate(() => {}, "not an array")).toThrow(TypeError);
    });
  });

  describe("clearImmediate", () => {
    it("cancels the execution of the callback", async () => {
      let executed = false;
      const id = setImmediate(() => {
        executed = true;
      });
      clearImmediate(id);

      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(executed).toBe(false);
    });

    it("does nothing if immediate does not exist", () => {
      expect(clearImmediate(999999)).toBe(null);
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
});
