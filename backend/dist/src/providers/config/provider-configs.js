"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidProviderType = exports.getProviderConfig = exports.PROVIDER_CONFIGS = void 0;
const llm_provider_interface_1 = require("../interfaces/llm-provider.interface");
exports.PROVIDER_CONFIGS = {
    [llm_provider_interface_1.LLMProviderType.OPENAI_COMPATIBLE]: {
        name: 'OpenAI Compatible',
        description: 'Use any OpenAI-compatible API (OpenAI, Azure OpenAI, LM Studio, etc.)',
        requiredFields: ['endpoint', 'apiKey', 'modelId'],
        optionalFields: ['temperature', 'maxTokens'],
        examples: [
            { name: 'OpenAI', endpoint: 'https://api.openai.com/v1' },
            { name: 'Local (LM Studio)', endpoint: 'http://localhost:1234/v1' },
            {
                name: 'Azure OpenAI',
                endpoint: 'https://<resource>.openai.azure.com/v1',
            },
        ],
    },
    [llm_provider_interface_1.LLMProviderType.YANDEX_GPT]: {
        name: 'Yandex GPT',
        description: 'Use Yandex Cloud GPT models',
        requiredFields: ['apiKey', 'folderId', 'modelId'],
        optionalFields: ['temperature', 'maxTokens'],
        baseUrl: 'https://ai.api.cloud.yandex.net/v1',
        models: ['yandexgpt/latest', 'yandexgpt-3', 'yandexgpt-3-lite'],
    },
    [llm_provider_interface_1.LLMProviderType.OLLAMA]: {
        name: 'Ollama',
        description: 'Use local Ollama instance',
        requiredFields: ['endpoint', 'modelId'],
        optionalFields: ['temperature', 'maxTokens'],
        baseUrl: 'http://localhost:11434',
        examples: [
            { name: 'Local Ollama', endpoint: 'http://localhost:11434' },
            { name: 'Remote Ollama', endpoint: 'http://ollama-server:11434' },
        ],
    },
    [llm_provider_interface_1.LLMProviderType.LOCAL]: {
        name: 'Local LLM',
        description: 'Use local LLM running on this machine',
        requiredFields: ['endpoint', 'modelId'],
        optionalFields: ['temperature', 'maxTokens'],
        baseUrl: 'http://localhost:8000',
    },
};
const getProviderConfig = (type) => {
    return exports.PROVIDER_CONFIGS[type];
};
exports.getProviderConfig = getProviderConfig;
const isValidProviderType = (type) => {
    return Object.values(llm_provider_interface_1.LLMProviderType).includes(type);
};
exports.isValidProviderType = isValidProviderType;
//# sourceMappingURL=provider-configs.js.map