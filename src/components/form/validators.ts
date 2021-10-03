export const withConditions =
    (
        validator: (value: string) => Array<string>,
        ...conditions: Array<(value: string) => boolean>
    ) =>
    (value: string) =>
        conditions.every(condition => condition(value)) ? validator(value) : [];

export const isNonZeroLength = (value: string) => value.length > 0;

export const shouldBeNotEmpty =
    (message: string = 'Should be not empty') =>
    (value: string) =>
        value.length === 0 ? [message] : [];

export const shouldBeAtLeastN =
    (n: number, message: string = `Should be at least ${n} characters`) =>
    (value: string) =>
        value.length < n ? [message] : [];

export const shouldBeANumber =
    (message: string = 'Should be a number') =>
    (value: string) =>
        isNaN(parseInt(value)) ? [message] : [];

export const shouldMatchRegex =
    (regex: RegExp, message: string = `Should match the regex: ${regex}`) =>
    (value: string) =>
        value.match(regex) ? [] : [message];
