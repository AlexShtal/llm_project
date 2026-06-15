"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAICompatibleProvider = void 0;
const common_1 = require("@nestjs/common");
const llm_provider_interface_1 = require("../interfaces/llm-provider.interface");
let OpenAICompatibleProvider = class OpenAICompatibleProvider {
    type = llm_provider_interface_1.LLMProviderType.OPENAI_COMPATIBLE;
    async validateConfig(config) {
        if (!config.endpoint) {
            throw new common_1.BadRequestException('OpenAI endpoint is required');
        }
        if (!config.modelId) {
            throw new common_1.BadRequestException('Model ID is required');
        }
        return true;
    }
    generateRequest(messages, model) {
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
    parseResponse(response) {
        if (typeof response === 'string') {
            return { success: true, text: response };
        }
        if (!response || typeof response !== 'object') {
            return { success: false, error: 'Invalid response format' };
        }
        const result = response;
        if (result.error) {
            const errorMsg = typeof result.error === 'string'
                ? result.error
                : result.error.message || 'Unknown error';
            return { success: false, error: errorMsg };
        }
        const content = result.choices?.[0]?.message?.content || result.choices?.[0]?.text || '';
        if (!content) {
            return { success: false, error: 'No content in response' };
        }
        return { success: true, text: content };
    }
    getRequestHeaders(config) {
        const headers = {
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
    getEndpoint(config) {
        const endpoint = config.endpoint.replace(/\/+$/, '');
        if (endpoint.endsWith('/chat/completions')) {
            return endpoint;
        }
        return `${endpoint}/chat/completions`;
    }
};
exports.OpenAICompatibleProvider = OpenAICompatibleProvider;
exports.OpenAICompatibleProvider = OpenAICompatibleProvider = __decorate([
    (0, common_1.Injectable)()
], OpenAICompatibleProvider);
//# sourceMappingURL=openai-compatible.provider.js.map