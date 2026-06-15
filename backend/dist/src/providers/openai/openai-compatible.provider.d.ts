import { ILLMProvider, ProviderConfig, ProviderMessage, ProviderRequestBody, ProviderResponse, LLMProviderType } from '../interfaces/llm-provider.interface';
export declare class OpenAICompatibleProvider implements ILLMProvider {
    type: LLMProviderType;
    validateConfig(config: ProviderConfig): Promise<boolean>;
    generateRequest(messages: ProviderMessage[], model: string): ProviderRequestBody;
    parseResponse(response: unknown): ProviderResponse;
    getRequestHeaders(config: ProviderConfig): Record<string, string>;
    getEndpoint(config: ProviderConfig): string;
}
