# Changelog

## v0.0.0-alpha4 - March 29, 2026

### Added

- **`math->hcf`**: Returns the highest common factor of a set of numbers.
- **`math->gcd`**: Returns the greatest common divisor of a set of numbers.
- **`math->lcm`**: Returns the lowest common multiple of a set of numbers.
- **`misc->allowGC`**: Allows an object prevented from garbage collection by `misc->preventGC` to be garbage collected.
- **`misc->preventGC`**: Prevents an object from being garbage collected. Use with caution!
- **`timing->ticker`**: Provides a simple ticker for executing callbacks at specific intervals.

### Changed

- **`misc->setImmediate`**: Moved to `timing->setImmediate`.
- **`misc->clearImmediate`**: Moved to `timing->clearImmediate`.

## v0.0.0-alpha3 - March 27, 2026

### Added

- **`misc->readFileChunks`**: Added utility to read files in chunks using async generators.

### Changed

- **`misc->setImmediate`**: Added callback arguments type inference.

## v0.0.0-alpha2.1 - February 21, 2026

### Added

- **`data->clone`**: Added utility to create deep clones of data.
- **`data->object->walk`**: Added utility to recursively traverse object properties and yield data about them.

## v0.0.0-alpha2 - February 21, 2026

### Added

- **`data->array->prepend`**: Added utility to prepend elements to an array, supporting single or multiple items and arrays of items.
- **`data->object->deepFreeze`**: Added utility to recursively freeze objects and arrays, with support for circular references using `WeakSet`.
- **`types->DeepFrozen`**: Added type utility for recursively readonly objects and arrays.
- **`types->ArrayOf`**: Added type utility for fixed-length arrays.

### Changed

- **`data->array->append`**: Updated implementation to be more concise.
- **`canvas` tests**: Updated web canvas tests to use a tolerance-based pixel comparison to reduce flakiness caused by browser anti-fingerprinting protections.
- **`types->Vector2` / `Vector3`**: Updated to use the new `ArrayOf` type.

## v0.0.0-alpha.1
