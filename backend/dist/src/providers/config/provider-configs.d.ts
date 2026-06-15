import { LLMProviderType } from '../interfaces/llm-provider.interface';
export declare const PROVIDER_CONFIGS: {
    "openai-compatible": {
        name: string;
        description: string;
        requiredFields: string[];
        optionalFields: string[];
        examples: {
            name: string;
            endpoint: string;
        }[];
    };
    "yandex-gpt": {
        name: string;
        description: string;
        requiredFields: string[];
        optionalFields: string[];
        baseUrl: string;
        models: string[];
    };
    ollama: {
        name: string;
        description: string;
        requiredFields: string[];
        optionalFields: string[];
        baseUrl: string;
        examples: {
            name: string;
            endpoint: string;
        }[];
    };
    local: {
        name: string;
        description: string;
        requiredFields: string[];
        optionalFields: string[];
        baseUrl: string;
    };
};
export declare const getProviderConfig: (type: LLMProviderType) => {
    name: string;
    description: string;
    requiredFields: string[];
    optionalFields: string[];
    examples: {
        name: string;
        endpoint: string;
    }[];
} | {
    name: string;
    description: string;
    requiredFields: string[];
    optionalFields: string[];
    baseUrl: string;
    models: string[];
} | {
    name: string;
    description: string;
    requiredFields: string[];
    optionalFields: string[];
    baseUrl: string;
    examples: {
        name: string;
        endpoint: string;
    }[];
} | {
    name: string;
    description: string;
    requiredFields: string[];
    optionalFields: string[];
    baseUrl: string;
};
export declare const isValidProviderType: (type: string) => type is LLMProviderType;
