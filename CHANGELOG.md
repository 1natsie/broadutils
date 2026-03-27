# Changelog

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
