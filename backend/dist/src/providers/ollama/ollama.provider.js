"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaProvider = void 0;
const common_1 = require("@nestjs/common");
const llm_provider_interface_1 = require("../interfaces/llm-provider.interface");
let OllamaProvider = class OllamaProvider {
    type = llm_provider_interface_1.LLMProviderType.OLLAMA;
    async validateConfig(config) {
        if (!config.endpoint) {
            throw new common_1.BadRequestException('Ollama endpoint is required');
        }
        if (!config.modelId) {
            throw new common_1.BadRequestException('Model ID is required');
        }
        try {
            const endpoint = this.getEndpoint(config);
            const response = await fetch(`${endpoint}/tags`);
            return response.ok;
        }
        catch {
            throw new common_1.BadRequestException('Failed to connect to Ollama endpoint');
        }
    }
    generateRequest(messages, model) {
        return {
            model,
            messages: messages.map((msg) => ({
                role: msg.role === 'developer' ? 'user' : msg.role,
                content: msg.content,
            })),
            stream: false,
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
            return { success: false, error: result.error };
        }
        let content = '';
        if (typeof result.message === 'string') {
            content = result.message;
        }
        else if (result.message?.content) {
            content = result.message.content;
        }
        else if (result.response) {
            content = result.response;
        }
        if (!content) {
            return { success: false, error: 'No content in response' };
        }
        return { success: true, text: content };
    }
    getRequestHeaders() {
        return {
            'Content-Type': 'application/json',
        };
    }
    getEndpoint(config) {
        const endpoint = config.endpoint;
        return endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
    }
    async getAvailableModels(config) {
        try {
            const endpoint = this.getEndpoint(config);
            const response = await fetch(`${endpoint}/api/tags`);
            const data = (await response.json());
            return data.models?.map((m) => m.name) || [];
        }
        catch {
            return [];
        }
    }
};
exports.OllamaProvider = OllamaProvider;
exports.OllamaProvider = OllamaProvider = __decorate([
    (0, common_1.Injectable)()
], OllamaProvider);
//# sourceMappingURL=ollama.provider.js.map