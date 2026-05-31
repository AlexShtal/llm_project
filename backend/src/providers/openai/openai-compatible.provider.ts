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
    if (!config.modelId) {
      throw new BadRequestException('Model ID is required');
    }

    return true;
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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (config.apiKey) {
      headers.Authorization = `Bearer ${config.apiKey}`;
    }

    if (String(config.endpoint).includes('ngrok-free.app')) {
      headers['ngrok-skip-browser-warning'] = 'true';
    }

    return headers;
  }

  getEndpoint(config: ProviderConfig): string {
    const endpoint = (config.endpoint as string).replace(/\/+$/, '');
    if (endpoint.endsWith('/chat/completions')) {
      return endpoint;
    }
    return `${endpoint}/chat/completions`;
  }
}
