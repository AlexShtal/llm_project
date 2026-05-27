import { LLMProviderType } from '../interfaces/llm-provider.interface';

export const PROVIDER_CONFIGS = {
  [LLMProviderType.OPENAI_COMPATIBLE]: {
    name: 'OpenAI Compatible',
    description:
      'Use any OpenAI-compatible API (OpenAI, Azure OpenAI, LM Studio, etc.)',
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
  [LLMProviderType.YANDEX_GPT]: {
    name: 'Yandex GPT',
    description: 'Use Yandex Cloud GPT models',
    requiredFields: ['apiKey', 'folderId', 'modelId'],
    optionalFields: ['temperature', 'maxTokens'],
    baseUrl: 'https://ai.api.cloud.yandex.net/v1',
    models: ['yandexgpt/latest', 'yandexgpt-3', 'yandexgpt-3-lite'],
  },
  [LLMProviderType.OLLAMA]: {
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
  [LLMProviderType.LOCAL]: {
    name: 'Local LLM',
    description: 'Use local LLM running on this machine',
    requiredFields: ['endpoint', 'modelId'],
    optionalFields: ['temperature', 'maxTokens'],
    baseUrl: 'http://localhost:8000',
  },
};

export const getProviderConfig = (type: LLMProviderType) => {
  return PROVIDER_CONFIGS[type];
};

export const isValidProviderType = (type: string): type is LLMProviderType => {
  return Object.values(LLMProviderType).includes(type as LLMProviderType);
};
