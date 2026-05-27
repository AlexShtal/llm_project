export enum LLMProviderType {
  OPENAI_COMPATIBLE = 'openai-compatible',
  YANDEX_GPT = 'yandex-gpt',
  OLLAMA = 'ollama',
  LOCAL = 'local',
}

export interface ProviderMessage {
  role: 'user' | 'assistant' | 'system' | 'developer';
  content: string;
}

export interface ProviderRequestBody {
  [key: string]: unknown;
}

export interface ProviderResponse {
  success: boolean;
  text?: string;
  error?: string;
}

export interface ProviderConfig {
  type: LLMProviderType;
  endpoint?: string;
  apiKey?: string;
  modelId: string;
  [key: string]: unknown;
}

export interface ILLMProvider {
  type: LLMProviderType;

  validateConfig(config: ProviderConfig): Promise<boolean>;

  generateRequest(
    messages: ProviderMessage[],
    model: string,
  ): ProviderRequestBody;

  parseResponse(response: unknown): ProviderResponse;

  getRequestHeaders(config: ProviderConfig): Record<string, string>;

  getEndpoint(config: ProviderConfig): string;

  getAvailableModels?(config: ProviderConfig): Promise<string[]>;
}
