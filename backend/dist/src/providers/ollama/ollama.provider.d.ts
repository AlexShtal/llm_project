import { ILLMProvider, ProviderConfig, ProviderMessage, ProviderRequestBody, ProviderResponse, LLMProviderType } from '../interfaces/llm-provider.interface';
export declare class OllamaProvider implements ILLMProvider {
    type: LLMProviderType;
    validateConfig(config: ProviderConfig): Promise<boolean>;
    generateRequest(messages: ProviderMessage[], model: string): ProviderRequestBody;
    parseResponse(response: unknown): ProviderResponse;
    getRequestHeaders(): Record<string, string>;
    getEndpoint(config: ProviderConfig): string;
    getAvailableModels(config: ProviderConfig): Promise<string[]>;
}
