export type ArgType = "string" | "number" | "boolean";
export type PositionalArguments = {
    index: number;
    value: string;
}[];
export type TypeOf<T extends ArgType> = T extends "string" ? string : T extends "number" ? number : T extends "boolean" ? boolean : never;
export type ArgumentDescriptorSingle<T extends ArgType = ArgType> = {
    type: T;
    short?: string;
    default?: TypeOf<T>;
    multiple?: false;
    required?: boolean;
    validator?: ArgumentValidator<TypeOf<T>>;
};
export type ArgumentDescriptorMultiple<T extends ArgType = ArgType> = {
    type: T;
    short?: string;
    default?: TypeOf<T>[];
    multiple?: true;
    required?: boolean;
    appendToDefault?: boolean;
    validator?: ArgumentValidator<TypeOf<T>>;
};
export type ArgumentDescriptor<T extends ArgType = ArgType> = ArgumentDescriptorSingle<T> | ArgumentDescriptorMultiple<T>;
export type ArgumentsSpecification = {
    [index: string]: ArgumentDescriptor;
};
export type ArgumentValidator<T> = (value: T) => {
    valid: true;
} | {
    valid: false;
    reason?: string;
};
export interface ParseArgsConfig {
    args: string[];
    specification: ArgumentsSpecification;
    allowUnknown?: boolean;
}
export type OptionalArgs<T extends ArgumentsSpecification> = {
    [K in keyof T]: T[K]["required"] extends true ? never : T[K]["default"] extends T[K]["default"] & {} ? never : K;
}[keyof T];
export type ParseArgsResult<T extends ParseArgsConfig> = {
    values: ({
        [K in Exclude<keyof T["specification"], OptionalArgs<T["specification"]>>]: T["specification"][K]["multiple"] extends true ? TypeOf<T["specification"][K]["type"]>[] : TypeOf<T["specification"][K]["type"]>;
    } & {
        [K in OptionalArgs<T["specification"]>]?: TypeOf<T["specification"][K]["type"]>;
    }) & (T["allowUnknown"] extends true ? {
        [x: string]: any;
    } : {});
    positionals: PositionalArguments;
};
export interface ArgumentsSpecificationErrorOptions extends ErrorOptions {
    specification?: ArgumentsSpecification | null;
}
//# sourceMappingURL=parseArgs.types.d.ts.map