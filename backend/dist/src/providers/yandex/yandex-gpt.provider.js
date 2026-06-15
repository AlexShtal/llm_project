"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YandexGPTProvider = void 0;
const common_1 = require("@nestjs/common");
const llm_provider_interface_1 = require("../interfaces/llm-provider.interface");
let YandexGPTProvider = class YandexGPTProvider {
    type = llm_provider_interface_1.LLMProviderType.YANDEX_GPT;
    baseUrl = 'https://ai.api.cloud.yandex.net/v1';
    async validateConfig(config) {
        if (!config.apiKey) {
            throw new common_1.BadRequestException('Yandex API key is required');
        }
        if (!config.folderId) {
            throw new common_1.BadRequestException('Yandex folder ID is required');
        }
        if (!config.modelId) {
            throw new common_1.BadRequestException('Model ID is required');
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
        }
        catch {
            throw new common_1.BadRequestException('Failed to connect to Yandex API');
        }
    }
    generateRequest(messages, model) {
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
        const content = result.choices?.[0]?.message?.content || '';
        if (!content) {
            return { success: false, error: 'No content in response' };
        }
        return { success: true, text: content };
    }
    getRequestHeaders(config) {
        return {
            'Content-Type': 'application/json',
            Authorization: `Api-Key ${config.apiKey}`,
        };
    }
    getEndpoint() {
        return `${this.baseUrl}/chat/completions`;
    }
};
exports.YandexGPTProvider = YandexGPTProvider;
exports.YandexGPTProvider = YandexGPTProvider = __decorate([
    (0, common_1.Injectable)()
], YandexGPTProvider);
//# sourceMappingURL=yandex-gpt.provider.js.map