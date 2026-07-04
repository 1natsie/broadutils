import type { ArgumentsSpecification, ArgumentsSpecificationErrorOptions, ParseArgsConfig, ParseArgsResult } from "./types.ts";
declare class ArgumentsSpecificationError extends Error {
    readonly specification: ArgumentsSpecification | null;
    constructor(message: string, options?: ArgumentsSpecificationErrorOptions);
}
declare class ArgumentsParsingError extends Error {
}
declare const parseArgs: <T extends ParseArgsConfig>(config: T) => ParseArgsResult<T>;
export { ArgumentsParsingError, ArgumentsSpecificationError, parseArgs };
//# sourceMappingURL=parseArgs.d.ts.map