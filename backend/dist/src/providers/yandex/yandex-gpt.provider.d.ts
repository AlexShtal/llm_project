import { ILLMProvider, ProviderConfig, ProviderMessage, ProviderRequestBody, ProviderResponse, LLMProviderType } from '../interfaces/llm-provider.interface';
export declare class YandexGPTProvider implements ILLMProvider {
    type: LLMProviderType;
    private readonly baseUrl;
    validateConfig(config: ProviderConfig): Promise<boolean>;
    generateRequest(messages: ProviderMessage[], model: string): ProviderRequestBody;
    parseResponse(response: unknown): ProviderResponse;
    getRequestHeaders(config: ProviderConfig): Record<string, string>;
    getEndpoint(): string;
}
