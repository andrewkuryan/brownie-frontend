type PrimitiveTypeName =
    | 'string'
    | 'number'
    | 'boolean'
    | 'object'
    | 'string[]'
    | 'number[]'
    | 'object[]'
    | 'string?'
    | 'number?';

export type PrimitiveType<N extends PrimitiveTypeName> = N extends 'string'
    ? string
    : N extends 'number'
    ? number
    : N extends 'boolean'
    ? boolean
    : N extends 'object'
    ? object
    : N extends 'string[]'
    ? Array<string>
    : N extends 'number[]'
    ? Array<number>
    : N extends 'object[]'
    ? Array<object>
    : N extends 'string?'
    ? string | null
    : N extends 'number?'
    ? number | null
    : never;

export function getApiValues<T extends { [path: string]: PrimitiveTypeName }>(
    obj: any,
    paths: T,
): { [key in keyof T]: PrimitiveType<T[key]> } {
    const result: any = {};
    Object.entries(paths).forEach(([path, typeName]) => {
        result[path] = getApiValue(obj, path, typeName);
    });
    return result;
}

export function getApiValue<T extends PrimitiveTypeName>(
    obj: any,
    path: string,
    typeName: T,
): PrimitiveType<T> {
    switch (typeName) {
        case 'number[]':
        case 'object[]':
        case 'string[]':
            if (
                Array.isArray(obj[path]) &&
                (obj[path].length === 0 || typeof obj[path][0] === typeName.replace('[]', ''))
            ) {
                return obj[path];
            } else {
                throw new Error(`Type checking error: ${obj[path]} is not ${typeName}`);
            }
        case 'object':
            if (typeof obj[path] === typeName && !Array.isArray(obj[path])) {
                return obj[path];
            } else {
                throw new Error(`Type checking error: ${obj[path]} is not ${typeName}`);
            }
        case 'boolean':
        case 'number':
        case 'string':
            if (typeof obj[path] === typeName) {
                return obj[path];
            } else {
                throw new Error(`Type checking error: ${obj[path]} is not ${typeName}`);
            }
        case 'number?':
        case 'string?':
            if (
                typeof obj[path] === typeName.replace('?', '') ||
                obj[path] === null ||
                obj[path] === undefined
            ) {
                return obj[path];
            } else {
                throw new Error(`Type checking error: ${obj[path]} is not ${typeName}`);
            }
        default:
            throw new Error(`Unsupported type: ${typeName}`);
    }
}
