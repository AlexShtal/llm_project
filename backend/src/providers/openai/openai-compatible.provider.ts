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
export class OpenAICompatibleProvider implements ILLMProvider {
  type = LLMProviderType.OPENAI_COMPATIBLE;

  async validateConfig(config: ProviderConfig): Promise<boolean> {
    if (!config.endpoint) {
      throw new BadRequestException('OpenAI endpoint is required');
    }
    if (!config.apiKey) {
      throw new BadRequestException('OpenAI API key is required');
    }
    if (!config.modelId) {
      throw new BadRequestException('Model ID is required');
    }

    try {
      const headers = this.getRequestHeaders(config);
      const response = await fetch(new URL(this.getEndpoint(config)), {
        method: 'HEAD',
        headers,
      });
      return response.ok || response.status === 404;
    } catch {
      throw new BadRequestException('Failed to connect to OpenAI endpoint');
    }
  }

  generateRequest(
    messages: ProviderMessage[],
    model: string,
  ): ProviderRequestBody {
    return {
      model,
      messages: messages.map((msg) => ({
        role: msg.role === 'developer' ? 'user' : msg.role,
        content: msg.content,
      })),
      stream: false,
      temperature: 0.7,
      max_tokens: 2048,
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
      choices?: Array<{ message?: { content?: string }; text?: string }>;
      error?: { message?: string } | string;
    };

    if (result.error) {
      const errorMsg =
        typeof result.error === 'string'
          ? result.error
          : result.error.message || 'Unknown error';
      return { success: false, error: errorMsg };
    }

    const content =
      result.choices?.[0]?.message?.content || result.choices?.[0]?.text || '';

    if (!content) {
      return { success: false, error: 'No content in response' };
    }

    return { success: true, text: content };
  }

  getRequestHeaders(config: ProviderConfig): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    };
  }

  getEndpoint(config: ProviderConfig): string {
    const endpoint = config.endpoint as string;
    if (endpoint.endsWith('/')) {
      return endpoint + 'chat/completions';
    }
    return endpoint + '/chat/completions';
  }
}
