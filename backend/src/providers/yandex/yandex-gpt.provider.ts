import { Injectable, BadRequestException } from '@nestjs/common';
import {
  ILLMProvider,
  ProviderConfig,
  ProviderMessage,
  ProviderRequestBody,
  ProviderResponse,
  LLMProviderType,
} from '../interfaces/llm-provider.interface';

@Injectable()
export class YandexGPTProvider implements ILLMProvider {
  type = LLMProviderType.YANDEX_GPT;
  private readonly baseUrl = 'https://ai.api.cloud.yandex.net/v1';

  async validateConfig(config: ProviderConfig): Promise<boolean> {
    if (!config.apiKey) {
      throw new BadRequestException('Yandex API key is required');
    }
    if (!config.folderId) {
      throw new BadRequestException('Yandex folder ID is required');
    }
    if (!config.modelId) {
      throw new BadRequestException('Model ID is required');
    }

    try {
      const headers = this.getRequestHeaders(config);
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: `gpt://${config.folderId}/yandexgpt-3-lite`,
          messages: [{ role: 'user', content: 'test' }],
          stream: false,
        }),
      });
      return response.ok;
    } catch {
      throw new BadRequestException('Failed to connect to Yandex API');
    }
  }

  generateRequest(
    messages: ProviderMessage[],
    model: string,
  ): ProviderRequestBody {
    const folderId = model.split('/')[1] || '';
    return {
      model: `gpt://${folderId}/aliceai-llm`,
      messages: messages.map((msg) => ({
        role: msg.role === 'developer' ? 'user' : msg.role,
        content: msg.content,
      })),
      stream: false,
      temperature: 0.7,
    };
  }

  parseResponse(response: unknown): ProviderResponse {
    if (typeof response === 'string') {
      return { success: true, text: response };
    }

    if (!response || typeof response !== 'object') {
      return { success: false, error: 'Invalid response format' };
    }

    const result = response as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string } | string;
    };

    if (result.error) {
      const errorMsg =
        typeof result.error === 'string'
          ? result.error
          : result.error.message || 'Unknown error';
      return { success: false, error: errorMsg };
    }

    const content = result.choices?.[0]?.message?.content || '';

    if (!content) {
      return { success: false, error: 'No content in response' };
    }

    return { success: true, text: content };
  }

  getRequestHeaders(config: ProviderConfig): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Api-Key ${config.apiKey}`,
    };
  }

  getEndpoint(): string {
    return `${this.baseUrl}/chat/completions`;
  }
}
