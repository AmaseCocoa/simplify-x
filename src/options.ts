import optionDefinitions from './options.json';

interface VisibilityOption {
    title: string;
    description: string;
    selectors: readonly string[];
}

export const options = optionDefinitions satisfies Record<string, VisibilityOption>;

export type OptionKey = keyof typeof options;
export const optionKeys = Object.keys(options) as OptionKey[];
