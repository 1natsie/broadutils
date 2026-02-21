import { noop } from "../misc/misc.ts";
import type { CallbackFunctionOne, DeepFrozen } from "../types/types.ts";
import type {
  ArrayUtils,
  CloneState,
  DataUrlSource,
  ObjectUtils,
  StringUtils,
  WalkConfig,
  WalkEncounterDetails,
} from "./types.ts";

export const convertToDataUrl = async (
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
  else if (value instanceof Set) return new Set(value) as T;
  else {
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
  walk: function* (
    ...args: [object, (WalkConfig | null)?, CallbackFunctionOne<WalkEncounterDetails>?]
  ) {
    const defaultConfig: WalkConfig = { leafPriority: false };
    let value: object, config: WalkConfig, callback: CallbackFunctionOne<any>;
    switch (args.length) {
      case 1: {
        value = args[0];
        config = defaultConfig;
        callback = noop;
        break;
      }
      case 2: {
        value = args[0];
        config = args[1] && typeof args[1] === "object" ? args[1] : defaultConfig;
        callback = noop;
        break;
      }
      case 3: {
        value = args[0];
        config = args[1] && typeof args[1] === "object" ? args[1] : defaultConfig;
        callback = args[2] || noop;
      }
    }

    const entries = Object.entries(value);
    const selfDetail = { key: null, value: value, parent: null, children: entries };
    if (config.leafPriority) {
      for (const [_key, _value] of entries) {
        const isObject = typeof _value === "object";
        const detail = {
          key: _key,
          value: _value,
          parent: value,
          children: isObject ? Object.entries(_value) : null,
        };

        if (isObject) yield* object.walk(_value, config, callback);
        else {
          yield detail;
          callback(detail);
        }
      }

      yield selfDetail;
      callback(selfDetail);
    } else {
      yield selfDetail;
      callback(selfDetail);

      for (const [_key, _value] of entries) {
        const isObject = typeof _value === "object";
        const detail = {
          key: _key,
          value: _value,
          parent: value,
          children: isObject ? Object.entries(_value) : null,
        };

        yield detail;
        callback(detail);
        if (isObject) yield* object.walk(_value, config, callback);
      }
    }
  },
};

export const string: StringUtils = {
  reverse: (inputStr) => inputStr.split("").reverse().join(""),
  substitute: (inputStr, substitionMap) => {
    const subPairs =
      substitionMap instanceof Map ? [...substitionMap] : Object.entries(substitionMap);
    return subPairs.reduce((acc, [key, value]) => acc.replaceAll(key, value), inputStr);
  },
};

export * from "./types.ts";
