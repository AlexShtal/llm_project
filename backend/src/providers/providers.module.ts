import { Module } from '@nestjs/common';
import { OpenAICompatibleProvider } from './openai/openai-compatible.provider';
import { YandexGPTProvider } from './yandex/yandex-gpt.provider';
import { OllamaProvider } from './ollama/ollama.provider';
import { ProviderFactory } from './factory/provider.factory';

@Module({
  providers: [
    OpenAICompatibleProvider,
    YandexGPTProvider,
    OllamaProvider,
    ProviderFactory,
  ],
  exports: [ProviderFactory],
})
export class ProvidersModule {}
