"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderFactory = void 0;
const common_1 = require("@nestjs/common");
const llm_provider_interface_1 = require("../interfaces/llm-provider.interface");
const openai_compatible_provider_1 = require("../openai/openai-compatible.provider");
const yandex_gpt_provider_1 = require("../yandex/yandex-gpt.provider");
const ollama_provider_1 = require("../ollama/ollama.provider");
let ProviderFactory = class ProviderFactory {
    openaiProvider;
    yandexProvider;
    ollamaProvider;
    providers;
    constructor(openaiProvider, yandexProvider, ollamaProvider) {
        this.openaiProvider = openaiProvider;
        this.yandexProvider = yandexProvider;
        this.ollamaProvider = ollamaProvider;
        this.providers = new Map([
            [llm_provider_interface_1.LLMProviderType.OPENAI_COMPATIBLE, this.openaiProvider],
            [llm_provider_interface_1.LLMProviderType.YANDEX_GPT, this.yandexProvider],
            [llm_provider_interface_1.LLMProviderType.OLLAMA, this.ollamaProvider],
            [llm_provider_interface_1.LLMProviderType.LOCAL, this.ollamaProvider],
        ]);
    }
    getProvider(config) {
        const provider = this.providers.get(config.type);
        if (!provider) {
            throw new common_1.BadRequestException(`Provider ${config.type} is not supported`);
        }
        return provider;
    }
    getProviderByType(type) {
        const provider = this.providers.get(type);
        if (!provider) {
            throw new common_1.BadRequestException(`Provider ${type} is not supported`);
        }
        return provider;
    }
    getAvailableProviders() {
        return Array.from(this.providers.keys());
    }
};
exports.ProviderFactory = ProviderFactory;
exports.ProviderFactory = ProviderFactory = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [openai_compatible_provider_1.OpenAICompatibleProvider,
        yandex_gpt_provider_1.YandexGPTProvider,
        ollama_provider_1.OllamaProvider])
], ProviderFactory);
//# sourceMappingURL=provider.factory.js.map