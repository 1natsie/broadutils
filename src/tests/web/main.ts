/// <reference types="mocha" />

mocha.setup("bdd");
await import("./tests/canvas.test.ts");
await import("./tests/data.test.ts");
await import("./tests/math.test.ts");
await import("./tests/misc.test.ts");
await import("./tests/network.test.ts");
await import("./tests/timing.test.ts");
await import("./tests/validate.test.ts");

setTimeout(() => mocha.run(), 500);
export {};
