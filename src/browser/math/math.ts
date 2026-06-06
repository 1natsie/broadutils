import type {
  Average,
  Clamp,
  Constrain,
  ConversionInterface,
  HCF,
  LCM,
  Max,
  Min,
} from "./types.ts";

const nonNullable = <T>(value: T, message?: string): NonNullable<T> => {
  if (value != null) return value;
  throw new TypeError(message ?? "The provided value is null or undefined");
};

const getArgumentValues = <T>(values: [Iterable<T>] | T[]): T[] => {
  if (values.length === 0) return values.slice();

  const firstValue = values[0];
  if (typeof firstValue !== "object" || firstValue === null) return values.slice() as T[];
  return Symbol.iterator in firstValue ? [...firstValue] : (values.slice() as T[]);
};

export const min: Min = <T extends number | bigint>(...values: T[]): T => {
  let minNumber: number | null = null;
  let minBigInt: bigint | null = null;

  for (let i = 0; i < values.length; ++i) {
    const value = values[i]!;

    if (typeof value === "number") {
      minNumber = minNumber ?? value;
      minNumber = minNumber > value ? value : minNumber;
      continue;
    }

    if (typeof value === "bigint") {
      minBigInt = minBigInt ?? value;
      minBigInt = minBigInt > value ? value : minBigInt;
      continue;
    }

    throw new TypeError(`Expected number or bigint, got ${typeof value}`);
  }

  if (minNumber === null && minBigInt === null) return Number.NEGATIVE_INFINITY as T;
  if (minNumber === null) return minBigInt as T;
  if (minBigInt === null) return minNumber as T;
  return nonNullable(minNumber < minBigInt ? minNumber : minBigInt) as T;
};

export const max: Max = <T extends number | bigint>(...values: T[]): T => {
  let maxNumber: number | null = null;
  let maxBigInt: bigint | null = null;

  for (let i = 0; i < values.length; ++i) {
    const value = values[i]!;

    if (typeof value === "number") {
      maxNumber = maxNumber ?? value;
      maxNumber = maxNumber > value ? maxNumber : value;
      continue;
    }

    if (typeof value === "bigint") {
      maxBigInt = maxBigInt ?? value;
      maxBigInt = maxBigInt > value ? maxBigInt : value;
      continue;
    }

    throw new TypeError(`Expected number or bigint, got ${typeof value}`);
  }

  if (maxNumber === null && maxBigInt === null) return Number.POSITIVE_INFINITY as T;
  if (maxNumber === null) return maxBigInt as T;
  if (maxBigInt === null) return maxNumber as T;
  return nonNullable(maxNumber > maxBigInt ? maxNumber : maxBigInt) as T;
};

export const clamp: Clamp = <T extends number | bigint>(value: T, min: T, max: T): T => {
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

export const constrain: Constrain = (value, low, high) => {
  return Math.max(Math.min((value - low) / (high - low), 1), 0);
};

export const average: Average = (...values: [Iterable<number>] | number[]) => {
  if (values.length === 0) return 0;

  const _values = getArgumentValues(values);
  let sum = 0;
  let length = 0;

  for (const value of _values) ((sum += value), ++length);
  return length === 0 ? 0 : sum / length;
};

export const hcf: HCF = (...values: [Iterable<number>] | number[]): number => {
  const candidates = getArgumentValues(values);
  const lastIndex = candidates.length - 1;
  if (candidates.length === 0) return 1;

  let i = 0;
  let temp = 0;
  while (i < lastIndex) {
    if (i === candidates.length - 1) break;

    let a = candidates[i] ?? 1;
    let b = candidates[i + 1] ?? 1;
    while (b > 0) ((a %= b), (temp = a), (a = b), (b = temp));

    candidates[i + 1] = a;
    i++;
  }

  return candidates[lastIndex] ?? 1;
};

export const lcm: LCM = (...values: [Iterable<number>] | number[]): number => {
  const candidates = getArgumentValues(values);
  const lastIndex = candidates.length - 1;
  if (candidates.length < 2) return candidates[0] ?? 1;

  for (let i = 0; i < lastIndex; i++) {
    const a = candidates[i] ?? 1;
    const b = candidates[i + 1] ?? 1;
    candidates[i + 1] = (a * b) / hcf(a, b);
  }
  return candidates[lastIndex] ?? 1;
};

export const convert: ConversionInterface = {
  degrees: {
    gradians: (value) => (value * 10) / 9,
    radians: (value) => (value * Math.PI) / 180,
    turns: (value) => value / 360,
  },

  gradians: {
    degrees: (value) => (value * 9) / 10,
    radians: (value) => (value * Math.PI) / 200,
    turns: (value) => value / 400,
  },

  radians: {
    degrees: (value) => (value * 180) / Math.PI,
    gradians: (value) => (value * 200) / Math.PI,
    turns: (value) => value / (2 * Math.PI),
  },

  turns: {
    degrees: (value) => value * 360,
    radians: (value) => value * 2 * Math.PI,
    gradians: (value) => value * 400,
  },

  nanometers: null as unknown as ConversionInterface.Distance["nanometers"],
  nanometres: {
    micrometres: (value) => value / 1e3,
    millimetres: (value) => value / 1e6,
    centimetres: (value) => value / 1e7,
    decimetres: (value) => value / 1e8,
    metres: (value) => value / 1e9,
    decametres: (value) => value / 1e10,
    hectometres: (value) => value / 1e11,
    kilometres: (value) => value / 1e12,
  } as ConversionInterface.Distance["nanometres"],

  micrometers: null as unknown as ConversionInterface.Distance["micrometers"],
  micrometres: {
    nanometres: (value) => value * 1e3,
    millimetres: (value) => value / 1e3,
    centimetres: (value) => value / 1e4,
    decimetres: (value) => value / 1e5,
    metres: (value) => value / 1e6,
    decametres: (value) => value / 1e7,
    hectometres: (value) => value / 1e8,
    kilometres: (value) => value / 1e9,
  } as ConversionInterface.Distance["micrometres"],

  millimeters: null as unknown as ConversionInterface.Distance["millimeters"],
  millimetres: {
    nanometres: (value) => value * 1e6,
    micrometres: (value) => value * 1e3,
    centimetres: (value) => value / 1e1,
    decimetres: (value) => value / 1e2,
    metres: (value) => value / 1e3,
    decametres: (value) => value / 1e4,
    hectometres: (value) => value / 1e5,
    kilometres: (value) => value / 1e6,
  } as ConversionInterface.Distance["millimetres"],

  centimeters: null as unknown as ConversionInterface.Distance["centimeters"],
  centimetres: {
    nanometres: (value) => value * 1e7,
    micrometres: (value) => value * 1e4,
    millimetres: (value) => value * 1e1,
    decimetres: (value) => value / 1e1,
    metres: (value) => value / 1e2,
    decametres: (value) => value / 1e3,
    hectometres: (value) => value / 1e4,
    kilometres: (value) => value / 1e5,
  } as ConversionInterface.Distance["centimetres"],

  decimeters: null as unknown as ConversionInterface.Distance["decimeters"],
  decimetres: {
    nanometres: (value) => value * 1e8,
    micrometres: (value) => value * 1e5,
    millimetres: (value) => value * 1e2,
    centimetres: (value) => value * 1e1,
    metres: (value) => value / 1e1,
    decametres: (value) => value / 1e2,
    hectometres: (value) => value / 1e3,
    kilometres: (value) => value / 1e4,
  } as ConversionInterface.Distance["decimetres"],

  meters: null as unknown as ConversionInterface.Distance["meters"],
  metres: {
    nanometres: (value) => value * 1e9,
    micrometres: (value) => value * 1e6,
    millimetres: (value) => value * 1e3,
    centimetres: (value) => value * 1e2,
    decimetres: (value) => value * 1e1,
    decametres: (value) => value / 1e1,
    hectometres: (value) => value / 1e2,
    kilometres: (value) => value / 1e3,
  } as ConversionInterface.Distance["metres"],

  decameters: null as unknown as ConversionInterface.Distance["decameters"],
  decametres: {
    nanometres: (value) => value * 1e10,
    micrometres: (value) => value * 1e7,
    millimetres: (value) => value * 1e4,
    centimetres: (value) => value * 1e3,
    decimetres: (value) => value * 1e2,
    metres: (value) => value * 1e1,
    hectometres: (value) => value / 1e1,
    kilometres: (value) => value / 1e2,
  } as ConversionInterface.Distance["decametres"],

  hectometers: null as unknown as ConversionInterface.Distance["hectometers"],
  hectometres: {
    nanometres: (value) => value * 1e11,
    micrometres: (value) => value * 1e8,
    millimetres: (value) => value * 1e5,
    centimetres: (value) => value * 1e4,
    decimetres: (value) => value * 1e3,
    metres: (value) => value * 1e2,
    decametres: (value) => value * 1e1,
    kilometres: (value) => value / 1e1,
  } as ConversionInterface.Distance["hectometres"],

  kilometers: null as unknown as ConversionInterface.Distance["kilometers"],
  kilometres: {
    nanometres: (value) => value * 1e12,
    micrometres: (value) => value * 1e9,
    millimetres: (value) => value * 1e6,
    centimetres: (value) => value * 1e5,
    decimetres: (value) => value * 1e4,
    metres: (value) => value * 1e3,
    decametres: (value) => value * 1e2,
    hectometres: (value) => value * 1e1,
  } as ConversionInterface.Distance["kilometres"],

  nanograms: {
    micrograms: (value) => value / 1e3,
    milligrams: (value) => value / 1e6,
    centigrams: (value) => value / 1e7,
    decigrams: (value) => value / 1e8,
    grams: (value) => value / 1e9,
    decagrams: (value) => value / 1e10,
    hectograms: (value) => value / 1e11,
    kilograms: (value) => value / 1e12,
    tonnes: (value) => value / 1e15,
    pounds: (value) => (value / 1e9) * 0.002204623,
    ounces: (value) => (value / 1e9) * 0.03527396,
  },

  micrograms: {
    nanograms: (value) => value * 1e3,
    milligrams: (value) => value / 1e3,
    centigrams: (value) => value / 1e4,
    decigrams: (value) => value / 1e5,
    grams: (value) => value / 1e6,
    decagrams: (value) => value / 1e7,
    hectograms: (value) => value / 1e8,
    kilograms: (value) => value / 1e9,
    tonnes: (value) => value / 1e12,
    pounds: (value) => (value / 1e6) * 0.002204623,
    ounces: (value) => (value / 1e6) * 0.03527396,
  },

  milligrams: {
    nanograms: (value) => value * 1e6,
    micrograms: (value) => value * 1e3,
    centigrams: (value) => value / 1e1,
    decigrams: (value) => value / 1e2,
    grams: (value) => value / 1e3,
    decagrams: (value) => value / 1e4,
    hectograms: (value) => value / 1e5,
    kilograms: (value) => value / 1e6,
    tonnes: (value) => value / 1e9,
    pounds: (value) => (value / 1e3) * 0.002204623,
    ounces: (value) => (value / 1e3) * 0.03527396,
  },

  centigrams: {
    nanograms: (value) => value * 1e7,
    micrograms: (value) => value * 1e4,
    milligrams: (value) => value * 1e1,
    decigrams: (value) => value / 1e1,
    grams: (value) => value / 1e2,
    decagrams: (value) => value / 1e3,
    hectograms: (value) => value / 1e4,
    kilograms: (value) => value / 1e5,
    tonnes: (value) => value / 1e8,
    pounds: (value) => (value / 1e2) * 0.002204623,
    ounces: (value) => (value / 1e2) * 0.03527396,
  },

  decigrams: {
    nanograms: (value) => value * 1e8,
    micrograms: (value) => value * 1e5,
    milligrams: (value) => value * 1e2,
    centigrams: (value) => value * 1e1,
    grams: (value) => value / 1e1,
    decagrams: (value) => value / 1e2,
    hectograms: (value) => value / 1e3,
    kilograms: (value) => value / 1e4,
    tonnes: (value) => value / 1e7,
    pounds: (value) => (value / 1e1) * 0.002204623,
    ounces: (value) => (value / 1e1) * 0.03527396,
  },

  grams: {
    nanograms: (value) => value * 1e9,
    micrograms: (value) => value * 1e6,
    milligrams: (value) => value * 1e3,
    centigrams: (value) => value * 1e2,
    decigrams: (value) => value * 1e1,
    decagrams: (value) => value / 1e1,
    hectograms: (value) => value / 1e2,
    kilograms: (value) => value / 1e3,
    tonnes: (value) => value / 1e6,
    pounds: (value) => value * 0.002204623,
    ounces: (value) => value * 0.03527396,
  },

  decagrams: {
    nanograms: (value) => value * 1e10,
    micrograms: (value) => value * 1e7,
    milligrams: (value) => value * 1e4,
    centigrams: (value) => value * 1e3,
    decigrams: (value) => value * 1e2,
    grams: (value) => value * 1e1,
    hectograms: (value) => value / 1e1,
    kilograms: (value) => value / 1e2,
    tonnes: (value) => value / 1e5,
    pounds: (value) => value * 1e1 * 0.002204623,
    ounces: (value) => value * 1e1 * 0.03527396,
  },

  hectograms: {
    nanograms: (value) => value * 1e11,
    micrograms: (value) => value * 1e8,
    milligrams: (value) => value * 1e5,
    centigrams: (value) => value * 1e4,
    decigrams: (value) => value * 1e3,
    grams: (value) => value * 1e2,
    decagrams: (value) => value * 1e1,
    kilograms: (value) => value / 1e1,
    tonnes: (value) => value / 1e4,
    pounds: (value) => value * 1e2 * 0.002204623,
    ounces: (value) => value * 1e2 * 0.03527396,
  },

  kilograms: {
    nanograms: (value) => value * 1e12,
    micrograms: (value) => value * 1e9,
    milligrams: (value) => value * 1e6,
    centigrams: (value) => value * 1e5,
    decigrams: (value) => value * 1e4,
    grams: (value) => value * 1e3,
    decagrams: (value) => value * 1e2,
    hectograms: (value) => value * 1e1,
    tonnes: (value) => value / 1e3,
    pounds: (value) => value * 1e3 * 0.002204623,
    ounces: (value) => value * 1e3 * 0.03527396,
  },

  tonnes: {
    nanograms: (value) => value * 1e15,
    micrograms: (value) => value * 1e12,
    milligrams: (value) => value * 1e9,
    centigrams: (value) => value * 1e8,
    decigrams: (value) => value * 1e7,
    grams: (value) => value * 1e6,
    decagrams: (value) => value * 1e5,
    hectograms: (value) => value * 1e4,
    kilograms: (value) => value * 1e3,
    pounds: (value) => value * 1e6 * 0.002204623,
    ounces: (value) => value * 1e6 * 0.03527396,
  },

  pounds: {
    nanograms: (value) => (value / 0.002204623) * 1e9,
    micrograms: (value) => (value / 0.002204623) * 1e6,
    milligrams: (value) => (value / 0.002204623) * 1e3,
    centigrams: (value) => (value / 0.002204623) * 1e2,
    decigrams: (value) => (value / 0.002204623) * 1e1,
    grams: (value) => value / 0.002204623,
    decagrams: (value) => value / 0.002204623 / 1e1,
    hectograms: (value) => value / 0.002204623 / 1e2,
    kilograms: (value) => value / 0.002204623 / 1e3,
    tonnes: (value) => value / 0.002204623 / 1e6,
    ounces: (value) => value * 16,
  },

  ounces: {
    nanograms: (value) => (value / 0.03527396) * 1e9,
    micrograms: (value) => (value / 0.03527396) * 1e6,
    milligrams: (value) => (value / 0.03527396) * 1e3,
    centigrams: (value) => (value / 0.03527396) * 1e2,
    decigrams: (value) => (value / 0.03527396) * 1e1,
    grams: (value) => value / 0.03527396,
    decagrams: (value) => value / 0.03527396 / 1e1,
    hectograms: (value) => value / 0.03527396 / 1e2,
    kilograms: (value) => value / 0.03527396 / 1e3,
    tonnes: (value) => value / 0.03527396 / 1e6,
    pounds: (value) => value / 16,
  },

  nanoseconds: {
    microseconds: (value) => value / 1e3,
    milliseconds: (value) => value / 1e6,
    seconds: (value) => value / 1e9,
    minutes: (value) => value / 1e9 / 60,
    hours: (value) => value / 1e9 / 3600,
    days: (value) => value / 1e9 / 86400,
    weeks: (value) => value / 1e9 / 604800,
  },

  microseconds: {
    nanoseconds: (value) => value * 1e3,
    milliseconds: (value) => value / 1e3,
    seconds: (value) => value / 1e6,
    minutes: (value) => value / 1e6 / 60,
    hours: (value) => value / 1e6 / 3600,
    days: (value) => value / 1e6 / 86400,
    weeks: (value) => value / 1e6 / 604800,
  },

  milliseconds: {
    nanoseconds: (value) => value * 1e6,
    microseconds: (value) => value * 1e3,
    seconds: (value) => value / 1e3,
    minutes: (value) => value / 1e3 / 60,
    hours: (value) => value / 1e3 / 3600,
    days: (value) => value / 1e3 / 86400,
    weeks: (value) => value / 1e3 / 604800,
  },

  seconds: {
    nanoseconds: (value) => value * 1e9,
    microseconds: (value) => value * 1e6,
    milliseconds: (value) => value * 1e3,
    minutes: (value) => value / 60,
    hours: (value) => value / 3600,
    days: (value) => value / 86400,
    weeks: (value) => value / 604800,
  },

  minutes: {
    nanoseconds: (value) => value * 60 * 1e9,
    microseconds: (value) => value * 60 * 1e6,
    milliseconds: (value) => value * 60 * 1e3,
    seconds: (value) => value * 60,
    hours: (value) => value / 60,
    days: (value) => value / 1440,
    weeks: (value) => value / 10080,
  },

  hours: {
    nanoseconds: (value) => value * 3600 * 1e9,
    microseconds: (value) => value * 3600 * 1e6,
    milliseconds: (value) => value * 3600 * 1e3,
    seconds: (value) => value * 3600,
    minutes: (value) => value * 60,
    days: (value) => value / 24,
    weeks: (value) => value / 168,
  },

  days: {
    nanoseconds: (value) => value * 86400 * 1e9,
    microseconds: (value) => value * 86400 * 1e6,
    milliseconds: (value) => value * 86400 * 1e3,
    seconds: (value) => value * 86400,
    minutes: (value) => value * 1440,
    hours: (value) => value * 24,
    weeks: (value) => value / 7,
  },

  weeks: {
    nanoseconds: (value) => value * 604800 * 1e9,
    microseconds: (value) => value * 604800 * 1e6,
    milliseconds: (value) => value * 604800 * 1e3,
    seconds: (value) => value * 604800,
    minutes: (value) => value * 10080,
    hours: (value) => value * 168,
    days: (value) => value * 7,
  },
};

const distanceUnitPairs: Map<string, string> = new Map([
  ["nanometres", "nanometers"],
  ["micrometres", "micrometers"],
  ["millimetres", "millimeters"],
  ["centimetres", "centimeters"],
  ["decimetres", "decimeters"],
  ["metres", "meters"],
  ["decametres", "decameters"],
  ["hectometres", "hectometers"],
  ["kilometres", "kilometers"],
]);

for (const pair of distanceUnitPairs) {
  const interfaceObject = convert[pair[0] as keyof ConversionInterface];
  // @ts-expect-error
  convert[pair[1]] = interfaceObject;
  for (const pair2 of distanceUnitPairs) {
    if (!(pair2[0] in interfaceObject)) continue;
    // @ts-expect-error
    interfaceObject[pair2[1]] = interfaceObject[pair2[0]];
  }
}

export * from "./types.ts";
