import type { DeepFrozen, IfExtendsThenElse, Nullish, OrArray } from "../types/types.ts";

export type CloneState = { cache: WeakMap<object, object> };
export type DataUrlSource = OrArray<Blob | ArrayBuffer | ArrayBufferView<ArrayBuffer>>;

export interface Base64 {
  readonly alphabet: readonly [
    readonly [base64ToAlpha: readonly number[], alphaToBase64: readonly number[]],
    readonly [base64ToAlpha: readonly number[], alphaToBase64: readonly number[]],
  ];

  /**
   * Encodes the given data into a base64 string.
   *
   * @param data The data to encode.
   * @param urlSafe Whether to use URL-safe base64 encoding.
   * @returns The base64-encoded string.
   */
  encode(data: ArrayBuffer | ArrayBufferView | string, urlSafe?: boolean): string;

  /**
   * Decodes the given base64 string into a Uint8Array.
   *
   * @param data The base64 string to decode.
   * @param urlSafe Whether the string is URL-safe base64.
   * @returns The decoded Uint8Array.
   */
  decode(data: string, urlSafe?: boolean): Uint8Array<ArrayBuffer>;

  /**
   * Decodes the given base64 string into a Uint8Array, ignoring invalid characters.
   *
   * @param data The base64 string to decode.
   * @param urlSafe Whether the string is URL-safe base64.
   * @returns The decoded Uint8Array.
   */
  decodeNonStrict(data: string, urlSafe?: boolean): Uint8Array<ArrayBuffer>;
}

export interface ConverToDataUrl {
  /**
   * Converts the given source to a data URL.
   *
   * @param source The source to convert.
   * @param mimeType The MIME type of the source.
   * @returns A promise resolving to the data URL.
   */
  (source: DataUrlSource, mimeType?: string): Promise<string>;
}

export interface ArrayUtils {
  /**
   * Appends the given arrays to the end of the target array and returns the target array.
   *
   * @param target The target array to append to.
   * @param sources The arrays to append.
   * @returns The target array with the sources appended to the target.
   */
  append: {
    <T extends unknown[], A1 extends unknown[]>(target: T, ...sources: [A1]): [...T, ...A1];
    <T extends unknown[], A1 extends unknown[], A2 extends unknown[]>(
      target: T,
      ...sources: [A1, A2]
    ): [...T, ...A1, ...A2];
    <T extends unknown[], A1 extends unknown[], A2 extends unknown[], A3 extends unknown[]>(
      target: T,
      ...sources: [A1, A2, A3]
    ): [...T, ...A1, ...A2, ...A3];
    <T extends unknown[], Appended>(target: T, ...sources: Appended[]): [...T, ...Appended[]];
  };

  /**
   * Prepends the given arrays to the beginning of the target array and returns the target array.
   *
   * @param target The target array to prepend to.
   * @param sources The arrays to prepend.
   * @returns The target array with the sources prepended to the target.
   */
  prepend: {
    <T extends unknown[], P1 extends unknown[]>(target: T, ...sources: [P1]): [...P1, ...T];
    <T extends unknown[], P1 extends unknown[], P2 extends unknown[]>(
      target: T,
      ...sources: [P1, P2]
    ): [...P1, ...P2, ...T];
    <T extends unknown[], P1 extends unknown[], P2 extends unknown[], P3 extends unknown[]>(
      target: T,
      ...sources: [P1, P2, P3]
    ): [...P1, ...P2, ...P3, ...T];
    <T extends unknown[], Prepended>(target: T, ...sources: Prepended[]): [...Prepended[], ...T];
  };

  /**
   * Compares two arrays and returns a value indicating their relative order.
   *
   * @param a The first array to compare.
   * @param b The second array to compare.
   * @param compareFn The function to use for comparing elements.
   * @returns -1 if a < b, 0 if a === b, 1 if a > b.
   */
  compare: <T, U>(a: T[], b: U[], compareFn?: (a: T, b: U) => number) => -1 | 0 | 1;

  /**
   * Pads the start of the array with the given value.
   *
   * @param value The array to pad.
   * @param length The desired length of the array.
   * @param padWith The value to use for padding.
   * @returns The padded array.
   */
  padStart: <T extends unknown[]>(value: T, length: number, padWith?: unknown) => T;

  /**
   * Pads the end of the array with the given value.
   *
   * @param value The array to pad.
   * @param length The desired length of the array.
   * @param padWith The value to use for padding.
   * @returns The padded array.
   */
  padEnd: <T extends unknown[]>(value: T, length: number, padWith?: unknown) => T;

  /**
   * Returns a new array with the elements in reverse order.
   *
   * @param value The array to reverse.
   * @returns A new array with the elements in reverse order.
   */
  toReversed: <T>(value: T[]) => T[];
}

export interface ObjectUtils {
  /**
   * Freezes the given object and all its nested properties.
   *
   * @param obj The object to freeze.
   * @returns The frozen object.
   */
  deepFreeze<T extends object>(obj: T): DeepFrozen<T>;

  /**
   * Merges the given objects into a new object and returns the new object.
   *
   * @param sources The objects to merge.
   * @returns The new merged object.
   */
  merge<T, U, V, W>(
    ...sources: [T?, U?, V?, W?]
  ): IfExtendsThenElse<T, Nullish, {}, T> &
    IfExtendsThenElse<U, Nullish, {}, U> &
    IfExtendsThenElse<V, Nullish, {}, V> &
    IfExtendsThenElse<W, Nullish, {}, W>;

  /**
   * Merges the given objects into the first object and returns the merged object.
   *
   * @param sources The objects to merge.
   * @returns The new merged object.
   */
  merge(...sources: unknown[]): unknown;

  /**
   * Merges the given objects into the first object and returns the merged object.
   *
   * @param sources The objects to merge.
   * @returns The merged object.
   */
  mergeInto<T extends object, U, V, W>(
    ...sources: [T, U?, V?, W?]
  ): T &
    IfExtendsThenElse<U, Nullish, {}, U> &
    IfExtendsThenElse<V, Nullish, {}, V> &
    IfExtendsThenElse<W, Nullish, {}, W>;

  /**
   * Merges the given objects into the first object and returns the merged object.
   *
   * @param sources The objects to merge.
   * @returns The merged object.
   */
  mergeInto(...sources: unknown[]): unknown;

  /**
   * Returns a new object with the specified keys omitted.
   *
   * @param obj The object to omit keys from.
   * @param keys The keys to omit.
   * @returns A new object with the specified keys omitted.
   */
  omit<T extends {}, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;

  /**
   * Returns a new object with only the specified keys.
   *
   * @param obj The object to pick keys from.
   * @param keys The keys to pick.
   * @returns A new object with only the specified keys.
   */
  pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
}

export interface StringUtils {
  /**
   * Reverses the characters in a string.
   *
   * @param inputStr The string to reverse.
   * @returns The reversed string.
   */
  reverse(inputStr: string): string;

  /**
   * Substitutes placeholders in a string with the given values.
   *
   * @param inputStr The string to substitute.
   * @param substitions The substitutions to make.
   * @returns The string with substitutions made.
   */
  substitute(
    inputStr: string,
    substitions: Map<string | RegExp, string> | Record<string, string>,
  ): string;
}
