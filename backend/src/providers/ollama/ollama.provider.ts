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
export class OllamaProvider implements ILLMProvider {
  type = LLMProviderType.OLLAMA;

  async validateConfig(config: ProviderConfig): Promise<boolean> {
    if (!config.endpoint) {
      throw new BadRequestException('Ollama endpoint is required');
    }
    if (!config.modelId) {
      throw new BadRequestException('Model ID is required');
    }

    try {
      const endpoint = this.getEndpoint(config);
      const response = await fetch(`${endpoint}/tags`);
      return response.ok;
    } catch {
      throw new BadRequestException('Failed to connect to Ollama endpoint');
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
      message?: { content?: string } | string;
      response?: string;
      error?: string;
    };

    if (result.error) {
      return { success: false, error: result.error };
    }

    let content = '';
    if (typeof result.message === 'string') {
      content = result.message;
    } else if (result.message?.content) {
      content = result.message.content;
    } else if (result.response) {
      content = result.response;
    }

    if (!content) {
      return { success: false, error: 'No content in response' };
    }

    return { success: true, text: content };
  }

  getRequestHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
    };
  }

  getEndpoint(config: ProviderConfig): string {
    const endpoint = config.endpoint as string;
    return endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
  }

  async getAvailableModels(config: ProviderConfig): Promise<string[]> {
    try {
      const endpoint = this.getEndpoint(config);
      const response = await fetch(`${endpoint}/api/tags`);
      const data = (await response.json()) as {
        models?: Array<{ name: string }>;
      };
      return data.models?.map((m) => m.name) || [];
    } catch {
      return [];
    }
  }
}
