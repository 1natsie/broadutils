import type { DeepFrozen } from "../types/types.ts";
import type {
  ArrayUtils,
  Base64,
  CloneState,
  ConverToDataUrl,
  DataUrlSource,
  ObjectUtils,
  StringUtils,
} from "./types.ts";

export const textEncoder: TextEncoder = new TextEncoder();
export const textDecoder: TextDecoder = new TextDecoder();

export const base64: Base64 = Object.freeze({
  alphabet: (() => {
    const mapAlphabet = (
      alphabet: string,
    ): readonly [base64ToAlpha: readonly number[], alphaToBase64: readonly number[]] => {
      const base64ToAlpha: number[] = new Array(64).fill(0);
      const alphaToBase64: number[] = new Array(256).fill(64);
      for (let i = 0; i < alphabet.length; i++) {
        base64ToAlpha[i] = alphabet.charCodeAt(i);
        alphaToBase64[alphabet.charCodeAt(i)] = i;
      }
      return [base64ToAlpha, alphaToBase64];
    };

    return Object.freeze([
      mapAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"),
      mapAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"),
    ] as const);
  })(),

  encode: (data: ArrayBuffer | ArrayBufferView | string, urlSafe: boolean = false): string => {
    const bytes =
      typeof data === "string"
        ? textEncoder.encode(data)
        : ArrayBuffer.isView(data)
          ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
          : new Uint8Array(data);

    let offset = 0;
    let resultOffset = 0;

    const byteLength = bytes.length;
    const alphabet = urlSafe ? base64.alphabet[1][0] : base64.alphabet[0][0];
    const result = new Uint8Array(Math.ceil(byteLength / 3) * 4);

    while (offset < byteLength) {
      const triplet = (bytes[offset++]! << 16) | (bytes[offset++]! << 8) | bytes[offset++]!;
      result[resultOffset++] = alphabet[(triplet & 0xfc0000) >> 18]!;
      result[resultOffset++] = alphabet[(triplet & 0x3f000) >> 12]!;
      result[resultOffset++] = alphabet[(triplet & 0xfc0) >> 6]!;
      result[resultOffset++] = alphabet[triplet & 0x3f]!;
    }

    if (byteLength % 3) {
      const lastIndex = result.length - 1;
      if (byteLength % 3 === 1) result[lastIndex] = result[lastIndex - 1] = 61;
      else result[lastIndex] = 61;
    }

    return textDecoder.decode(result);
  },

  decode: (data: string, urlSafe: boolean = false): Uint8Array<ArrayBuffer> => {
    const alphabet = urlSafe ? base64.alphabet[1][1] : base64.alphabet[0][1];
    const result = new Uint8Array(Math.ceil(data.length / 4) * 3);

    const charCodes = textEncoder.encode(data);
    let resultOffset = 0;
    let charCodesIndex = 0;

    while (charCodesIndex < charCodes.length) {
      const triplet =
        (alphabet[charCodes[charCodesIndex++]!]! << 18) |
        (alphabet[charCodes[charCodesIndex++]!]! << 12) |
        (alphabet[charCodes[charCodesIndex++]!]! << 6) |
        alphabet[charCodes[charCodesIndex++]!]!;

      result[resultOffset++] = (triplet >> 16) & 0xff;
      result[resultOffset++] = (triplet >> 8) & 0xff;
      result[resultOffset++] = triplet & 0xff;
    }

    if (charCodes[charCodes.length - 1] === 61) {
      return result.slice(0, resultOffset - (charCodes[charCodes.length - 2] === 61 ? 2 : 1));
    }

    return result;
  },

  decodeNonStrict: (data: string, urlSafe: boolean = false): Uint8Array<ArrayBuffer> => {
    const alpha = urlSafe ? base64.alphabet[1][1] : base64.alphabet[0][1];
    const result = new Uint8Array(Math.ceil(data.length / 4) * 3);

    const charCodes = textEncoder.encode(data);
    const n16b = () => {
      while (index < charCodes.length && alpha[charCodes[index]!] === 64) index++;
      return alpha[charCodes[index++]!]! & 63;
    };

    let resultOffset = 0;
    let index = 0;

    while (index < charCodes.length) {
      const triplet = (n16b() << 18) | (n16b() << 12) | (n16b() << 6) | n16b();

      result[resultOffset++] = (triplet >> 16) & 0xff;
      result[resultOffset++] = (triplet >> 8) & 0xff;
      result[resultOffset++] = triplet & 0xff;
    }

    if (charCodes[charCodes.length - 1] === 61) {
      return result.slice(0, resultOffset - (charCodes[charCodes.length - 2] === 61 ? 2 : 1));
    }

    return result;
  },
});

export const convertToDataUrl: ConverToDataUrl = async (
  source: DataUrlSource,
  mimeType?: string,
): Promise<string> => {
  let blob: Blob;

  if (source instanceof Blob) blob = mimeType ? new Blob([source], { type: mimeType }) : source;
  else
    blob = new Blob(
      Array.isArray(source) ? source : [source],
      mimeType ? { type: mimeType } : undefined,
    );

  const fileReader = new FileReader();
  return new Promise((resolve, reject) => {
    fileReader.onloadend = () => {
      if (typeof fileReader.result === "string") resolve(fileReader.result);
      else reject(new Error("Failed to convert to data URL"));
    };
    fileReader.onerror = () => reject(fileReader.error);
    fileReader.readAsDataURL(blob);
  });
};

const arrayCompare = (a: any, b: any): number => {
  if (Array.isArray(a) && Array.isArray(b)) return array.compare(a, b);
  if (typeof a === "number" && typeof b === "number") {
    return (a === b ? 0 : +(a > b) - 1 || 1) as -1 | 0 | 1;
  }

  const _a = String(a);
  const _b = String(b);

  return (_a === _b ? 0 : +(_a > _b) - 1 || 1) as -1 | 0 | 1;
};

export const array: ArrayUtils = {
  append: <T extends unknown[], Appended>(
    target: T,
    ...sources: Appended[][]
  ): [...T, ...Appended[]] => {
    target.push(...sources.flat());
    return target as unknown as [...T, ...Appended[]];
  },
  prepend: <T extends unknown[], Prepended>(
    target: T,
    ...sources: Prepended[][]
  ): [...Prepended[], ...T] => {
    target.unshift(...sources.flat());
    return target as unknown as [...Prepended[], ...T];
  },
  compare: <T, U>(a: T[], b: U[], compareFn = arrayCompare): -1 | 0 | 1 => {
    if (a.length < b.length) return -1;
    if (b.length < a.length) return 1;
    for (let i = 0; i < a.length; i++) {
      const result = compareFn(a[i], b[i]);
      if (result) return result < 0 ? -1 : 1;
    }

    return 0;
  },
  padStart: (value, length, padWith = 0) => {
    while (value.length < length) value.unshift(padWith as any);
    return value;
  },
  padEnd: (value, length, padWith = 0) => {
    while (value.length < length) value.push(padWith as any);
    return value;
  },
  toReversed: (value) => [...value].reverse(),
};

const createCloneState = (): CloneState => ({ cache: new WeakMap() });
export const clone = <T>(value: T, state: CloneState = createCloneState()): T => {
  if (value == null) return value;
  if (typeof value !== "object") return value;
  if (state.cache.has(value)) return state.cache.get(value) as T;

  if (Array.isArray(value)) {
    const result: any[] = [];
    state.cache.set(value, result);
    for (let i = 0; i < value.length; i++) result[i] = clone(value[i], state);
    return result as T;
  } else if (value instanceof Map) return new Map(value) as T;
  else if (value instanceof Set) {
    const result = new Set();
    const values = [...value];
    state.cache.set(value, result);
    for (let i = 0; i < values.length; i++) result.add(clone(values[i], state));
    return result as T;
  } else {
    const result: any = {};
    state.cache.set(value, result);
    for (const [key, _value] of Object.entries(value)) result[key] = clone(_value, state);
    return result as T;
  }
};

export const object: ObjectUtils = {
  deepFreeze: (value) => {
    const stack: any[] = [value];
    const encounterSet: WeakSet<object> = new WeakSet();

    do {
      const current = stack.pop();
      if (!(current && typeof current === "object")) continue;

      if (encounterSet.has(current)) continue; // circular reference

      Object.freeze(current);
      encounterSet.add(current);

      if (Array.isArray(current)) stack.push(...current);
      else stack.push(...Object.values(current));
    } while (stack.length);

    return value as DeepFrozen<typeof value>;
  },
  merge: (...sources: any[]) => Object.assign({}, ...sources),
  mergeInto: (...sources: any[]) => Object.assign(sources[0], ...sources),
  omit: <T extends {}, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = {} as Omit<T, K>;
    const toOmit = new Set(keys);
    for (const [key, value] of Object.entries(obj)) {
      if (toOmit.has(key as K)) continue;
      result[key as Exclude<keyof T, K>] = value as T[Exclude<keyof T, K>];
    }
    return result;
  },
  pick: <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    for (const key of keys) result[key] = obj[key];
    return result;
  },
};

export const string: StringUtils = {
  reverse: (inputStr) => inputStr.split("").reverse().join(""),
  substitute: (inputStr, substitions) => {
    const subPairs = substitions instanceof Map ? [...substitions] : Object.entries(substitions);
    return subPairs.reduce((acc, [key, value]) => {
      return typeof key === "string" ? acc.replaceAll(key, value) : acc.replace(key, value);
    }, inputStr);
  },
};

export * from "./types.ts";
