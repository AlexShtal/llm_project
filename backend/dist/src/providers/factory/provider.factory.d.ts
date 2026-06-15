import { ILLMProvider, LLMProviderType, ProviderConfig } from '../interfaces/llm-provider.interface';
import { OpenAICompatibleProvider } from '../openai/openai-compatible.provider';
import { YandexGPTProvider } from '../yandex/yandex-gpt.provider';
import { OllamaProvider } from '../ollama/ollama.provider';
export declare class ProviderFactory {
    private openaiProvider;
    private yandexProvider;
    private ollamaProvider;
    private providers;
    constructor(openaiProvider: OpenAICompatibleProvider, yandexProvider: YandexGPTProvider, ollamaProvider: OllamaProvider);
    getProvider(config: ProviderConfig): ILLMProvider;
    getProviderByType(type: LLMProviderType): ILLMProvider;
    getAvailableProviders(): LLMProviderType[];
}
