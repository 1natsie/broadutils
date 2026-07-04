# broadutils

A comprehensive utility library covering a wide range of use cases for both browser and Node.js environments.

## Features

- **Environment-specific Builds**: Optimised subpath exports for both `browser` and `node`.
- **Modular Design**: Import only what you need (e.g., `1n-broadutils/node/filesystem` or `1n-broadutils/browser/math`).
- **Fully Typed**: Built with TypeScript, providing excellent autocompletion and type safety.
- **Isomorphic Core**: Many utilities (`math`, `timing`, `validate`, `data`, `misc`) share a common API across environments.

## Installation

You can install `1n-broadutils` using npm, yarn, pnpm, bun, or jsr:

```bash
# npm
npm install 1n-broadutils

# yarn
yarn add 1n-broadutils

# pnpm
pnpm add 1n-broadutils

# bun
bun add 1n-broadutils

# jsr
npx jsr add @1natsie/broadutils
```

## Structure & Exports

The library is split into two primary environments: `./browser` and `./node`. Each environment has its own set of utilities, and some utilities are shared between both environments.

### Browser Exports

- `1n-broadutils/browser` - Main entry point for browser utilities.
- `1n-broadutils/browser/canvas` - Canvas utilities (`resize`, `getImage`, `getImageData`, `cloneImageData`, `getDimensions`, `mirrorImageToCanvas`, `createContextSnapshot`, `applyContextSnapshot`)
- `1n-broadutils/browser/data` - Data utilities (`array`, `base64`, `object`, `string`, `clone`, `convertToDataUrl`, `textEncoder`, `textDecoder`)
- `1n-broadutils/browser/math` - Math utilities (`min`, `max`, `clamp`, `constrain`, `average`, `hcf`, `lcm`, `convert`)
- `1n-broadutils/browser/misc` - Miscellaneous utilities (`noop`, `createDeferred`, `allowGC`, `preventGC`)
- `1n-broadutils/browser/network` - Network utilities (`fetch`)
- `1n-broadutils/browser/timing` - Timing utilities (`time`, `sleep`, `setImmediate`, `clearImmediate`)
- `1n-broadutils/browser/validate` - Validation utilities (`assert`, `check`, `isNonNullable`, `nonNullable`)
- `1n-broadutils/browser/types` - Type definitions

### Node.js Exports

- `1n-broadutils/node` - Main entry point for Node utilities.
- `1n-broadutils/node/data` - Data utilities
- `1n-broadutils/node/environment` - Environment utilities (`which`, `parseArgs`)
- `1n-broadutils/node/filesystem` - File system utilities (`betterReadStream`)
- `1n-broadutils/node/math` - Math utilities
- `1n-broadutils/node/misc` - Miscellaneous utilities
- `1n-broadutils/node/timing` - Timing utilities (`time`, `sleep`)
- `1n-broadutils/node/validate` - Validation utilities
- `1n-broadutils/node/types` - Type definitions

## Usage Examples

### Node.js Environment Utilities

```typescript
import { which } from "1n-broadutils/node/environment";

// Locate an executable in the system PATH
const nodePath = which("node");
console.log(nodePath); // e.g. /usr/bin/node

const multipleExes = which.many(["node", "npm"]);
```

### Node.js Filesystem Utilities

```typescript
import { betterReadStream } from "1n-broadutils/node/filesystem";

// Read a file using an async generator
for await (const chunk of betterReadStream("./large-file.txt", { chunkSize: 8192 })) {
  console.log(chunk.byteLength);
}
```

### Isomorphic Math Utilities

```typescript
// Import works from both browser or node entries
import { clamp, average, convert } from "1n-broadutils/browser/math";

const clamped = clamp(150, 0, 100); // 100
const avg = average([1, 2, 3, 4, 5]); // 3
```

### Browser Canvas Utilities

```typescript
import { resize, createContextSnapshot, applyContextSnapshot } from "1n-broadutils/browser/canvas";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;

// Resize canvas to [width, height]
resize(canvas, [800, 600]);

// Save and restore context state easily
const snapshot = createContextSnapshot(ctx);
// ... draw things ...
applyContextSnapshot(ctx, snapshot);
```

### Data Utilities

```typescript
import { array, clone, string } from "1n-broadutils/node/data";

// Deep clone objects
const original = { a: 1, b: { c: 2 } };
const copied = clone(original);
```

### Timing Utilities

```typescript
import { time } from "1n-broadutils/node/timing";

// Measure execution time
const [duration, result] = time(() => {
  // expensive operation
  return 42;
});
console.log(`Execution took ${duration}ms`);
```

## Contributing

1. Clone the repository.
2. Install dependencies using Bun:

   ```bash
   bun install --dev
   ```

3. Add awesome features or bug fixes.

4. Format the code:

   ```bash
   bun run format
   ```

5. Run the test suites:

   ```bash
   bun run test:node
   bun run test:browser
   ```

6. Build the project for distribution:

   ```bash
   bun run build
   ```

## License

This project is licensed under the MIT License - see the [`LICENSE`](./LICENSE) file for details.
