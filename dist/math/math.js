import { nonNullable } from "../validate/validate.js";
const getArgumentValues = (values) => {
    if (values.length === 0)
        return values.slice();
    const firstValue = values[0];
    if (typeof firstValue !== "object" || firstValue === null)
        return values.slice();
    return Symbol.iterator in firstValue ? [...firstValue] : values.slice();
};
export const min = (...values) => {
    let minNumber = null;
    let minBigInt = null;
    for (let i = 0; i < values.length; ++i) {
        const value = values[i];
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
    if (minNumber === null && minBigInt === null)
        return Number.NEGATIVE_INFINITY;
    if (minNumber === null)
        return minBigInt;
    if (minBigInt === null)
        return minNumber;
    return nonNullable(minNumber < minBigInt ? minNumber : minBigInt);
};
export const max = (...values) => {
    let maxNumber = null;
    let maxBigInt = null;
    for (let i = 0; i < values.length; ++i) {
        const value = values[i];
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
    if (maxNumber === null && maxBigInt === null)
        return Number.POSITIVE_INFINITY;
    if (maxNumber === null)
        return maxBigInt;
    if (maxBigInt === null)
        return maxNumber;
    return nonNullable(maxNumber > maxBigInt ? maxNumber : maxBigInt);
};
export const clamp = (value, min, max) => {
    if (value < min)
        return min;
    if (value > max)
        return max;
    return value;
};
export const constrain = (value, low, high) => {
    return Math.max(Math.min((value - low) / (high - low), 1), 0);
};
export const average = (...values) => {
    if (values.length === 0)
        return 0;
    const _values = getArgumentValues(values);
    let sum = 0;
    let length = 0;
    for (const value of _values)
        ((sum += value), ++length);
    return length === 0 ? 0 : sum / length;
};
export const hcf = (...values) => {
    const candidates = getArgumentValues(values);
    const lastIndex = candidates.length - 1;
    if (candidates.length === 0)
        return 1;
    let i = 0;
    let temp = 0;
    while (i < lastIndex) {
        if (i === candidates.length - 1)
            break;
        let a = candidates[i] ?? 1;
        let b = candidates[i + 1] ?? 1;
        while (b > 0)
            ((a %= b), (temp = a), (a = b), (b = temp));
        candidates[i + 1] = a;
        i++;
    }
    return candidates[lastIndex] ?? 1;
};
export const gcd = hcf;
export const lcm = (...values) => {
    const candidates = getArgumentValues(values);
    const lastIndex = candidates.length - 1;
    if (candidates.length < 2)
        return candidates[0] ?? 1;
    for (let i = 0; i < lastIndex; i++) {
        const a = candidates[i] ?? 1;
        const b = candidates[i + 1] ?? 1;
        candidates[i + 1] = (a * b) / hcf(a, b);
    }
    return candidates[lastIndex] ?? 1;
};
export const convert = (() => {
    const _convert = {
        angle: {
            degrees: {
                fromCommonUnit: (value) => value,
                toCommonUnit: (value) => value,
            },
            radians: {
                fromCommonUnit: (value) => value * (Math.PI / 180),
                toCommonUnit: (value) => (value * 180) / Math.PI,
            },
            gradians: {
                fromCommonUnit: (value) => (value * 10) / 9,
                toCommonUnit: (value) => (value * 9) / 10,
            },
            turns: {
                fromCommonUnit: (value) => value / 360,
                toCommonUnit: (value) => value * 360,
            },
        },
        distance: {
            metres: {
                fromCommonUnit: (value) => value,
                toCommonUnit: (value) => value,
            },
            nanometres: {
                fromCommonUnit: (value) => value * 1e9,
                toCommonUnit: (value) => value / 1e9,
            },
            micrometers: {
                fromCommonUnit: (value) => value * 1e6,
                toCommonUnit: (value) => value / 1e6,
            },
            millimetres: {
                fromCommonUnit: (value) => value * 1e3,
                toCommonUnit: (value) => value / 1e3,
            },
            centimetres: {
                fromCommonUnit: (value) => value * 100,
                toCommonUnit: (value) => value / 100,
            },
            decimetres: {
                fromCommonUnit: (value) => value * 10,
                toCommonUnit: (value) => value / 10,
            },
            kilometres: {
                fromCommonUnit: (value) => value / 1000,
                toCommonUnit: (value) => value * 1000,
            },
        },
        mass: {
            grams: {
                fromCommonUnit: (value) => value,
                toCommonUnit: (value) => value,
            },
            nanograms: {
                fromCommonUnit: (value) => value * 1e9,
                toCommonUnit: (value) => value / 1e9,
            },
            micrograms: {
                fromCommonUnit: (value) => value * 1e6,
                toCommonUnit: (value) => value / 1e6,
            },
            milligrams: {
                fromCommonUnit: (value) => value * 1e3,
                toCommonUnit: (value) => value / 1e3,
            },
            centigrams: {
                fromCommonUnit: (value) => value * 100,
                toCommonUnit: (value) => value / 100,
            },
            decigrams: {
                fromCommonUnit: (value) => value * 10,
                toCommonUnit: (value) => value / 10,
            },
            dekagrams: {
                fromCommonUnit: (value) => value / 10,
                toCommonUnit: (value) => value * 10,
            },
            kilograms: {
                fromCommonUnit: (value) => value / 1000,
                toCommonUnit: (value) => value * 1000,
            },
            tonnes: {
                fromCommonUnit: (value) => value / 1000000,
                toCommonUnit: (value) => value * 1000000,
            },
            tons: {
                fromCommonUnit: (value) => value / 907184.7,
                toCommonUnit: (value) => value * 907184.7,
            },
            pounds: {
                fromCommonUnit: (value) => value / 453.5924,
                toCommonUnit: (value) => value * 453.5924,
            },
            ounces: {
                fromCommonUnit: (value) => value / 28.34952,
                toCommonUnit: (value) => value * 28.34952,
            },
        },
        time: {
            seconds: {
                fromCommonUnit: (value) => value,
                toCommonUnit: (value) => value,
            },
            nanoseconds: {
                fromCommonUnit: (value) => value * 1e9,
                toCommonUnit: (value) => value / 1e9,
            },
            microseconds: {
                fromCommonUnit: (value) => value * 1e6,
                toCommonUnit: (value) => value / 1e6,
            },
            milliseconds: {
                fromCommonUnit: (value) => value * 1e3,
                toCommonUnit: (value) => value / 1e3,
            },
            centiseconds: {
                fromCommonUnit: (value) => value * 100,
                toCommonUnit: (value) => value / 100,
            },
            deciseconds: {
                fromCommonUnit: (value) => value * 10,
                toCommonUnit: (value) => value / 10,
            },
            minutes: {
                fromCommonUnit: (value) => value / 60,
                toCommonUnit: (value) => value * 60,
            },
            hours: {
                fromCommonUnit: (value) => value / 3600,
                toCommonUnit: (value) => value * 3600,
            },
            days: {
                fromCommonUnit: (value) => value / 86400,
                toCommonUnit: (value) => value * 86400,
            },
            weeks: {
                fromCommonUnit: (value) => value / 604800,
                toCommonUnit: (value) => value * 604800,
            },
            months: {
                fromCommonUnit: (value) => value / 2620800,
                toCommonUnit: (value) => value * 2620800,
            },
            years: {
                fromCommonUnit: (value) => value / 31449600,
                toCommonUnit: (value) => value * 31449600,
            },
        },
    };
    const units = {
        angle: new Set(["degrees", "radians", "gradians", "turns"]),
        distance: new Set([
            "nanometers",
            "micrometers",
            "millimetres",
            "centimetres",
            "decimetres",
            "metres",
            "kilometres",
        ]),
        mass: new Set([
            "nanograms",
            "micrograms",
            "milligrams",
            "centigrams",
            "decigrams",
            "grams",
            "kilograms",
            "tonnes",
            "tons",
            "pounds",
            "ounces",
        ]),
        time: new Set([
            "nanoseconds",
            "microseconds",
            "milliseconds",
            "seconds",
            "minutes",
            "hours",
            "days",
            "months",
            "years",
        ]),
    };
    const conversionTypes = ["angle", "distance", "mass", "time"];
    return (value, fromUnit, toUnit) => {
        for (let i = 0; i < conversionTypes.length; ++i) {
            const ctype = conversionTypes[i];
            if (units[ctype].has(fromUnit)) {
                if (!units[ctype].has(toUnit)) {
                    throw new Error(`Invalid target unit. Expected one of [${Array.from(units[ctype]).join(", ")}] but got ${toUnit}.`);
                }
                // @ts-expect-error
                return _convert[ctype][toUnit].fromCommonUnit(
                // @ts-expect-error
                _convert[ctype][fromUnit].toCommonUnit(value));
            }
        }
        throw new Error("Unknown source unit.");
    };
})();
//# sourceMappingURL=math.js.map