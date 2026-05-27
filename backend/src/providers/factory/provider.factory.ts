import { Injectable, BadRequestException } from '@nestjs/common';
import {
  ILLMProvider,
  LLMProviderType,
  ProviderConfig,
} from '../interfaces/llm-provider.interface';
import { OpenAICompatibleProvider } from '../openai/openai-compatible.provider';
import { YandexGPTProvider } from '../yandex/yandex-gpt.provider';
import { OllamaProvider } from '../ollama/ollama.provider';

@Injectable()
export class ProviderFactory {
  private providers: Map<LLMProviderType, ILLMProvider>;

  constructor(
    private openaiProvider: OpenAICompatibleProvider,
    private yandexProvider: YandexGPTProvider,
    private ollamaProvider: OllamaProvider,
  ) {
    this.providers = new Map([
      [LLMProviderType.OPENAI_COMPATIBLE, this.openaiProvider],
      [LLMProviderType.YANDEX_GPT, this.yandexProvider],
      [LLMProviderType.OLLAMA, this.ollamaProvider],
      [LLMProviderType.LOCAL, this.ollamaProvider],
    ]);
  }

  getProvider(config: ProviderConfig): ILLMProvider {
    const provider = this.providers.get(config.type);
    if (!provider) {
      throw new BadRequestException(`Provider ${config.type} is not supported`);
    }
    return provider;
  }

  getProviderByType(type: LLMProviderType): ILLMProvider {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new BadRequestException(`Provider ${type} is not supported`);
    }
    return provider;
  }

  getAvailableProviders(): LLMProviderType[] {
    return Array.from(this.providers.keys());
  }
}
