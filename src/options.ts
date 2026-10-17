import optionDefinitions from './options.json';

interface VisibilityOption {
    title: string;
    description: string;
    selectors: readonly string[];
    scriptSelectors?: readonly string[];
    liteDescription?: string;
}

export const options: Record<keyof typeof optionDefinitions, VisibilityOption> = optionDefinitions;

export type OptionKey = keyof typeof options;
export const optionKeys = Object.keys(options) as OptionKey[];
