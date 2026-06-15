"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvidersModule = void 0;
const common_1 = require("@nestjs/common");
const openai_compatible_provider_1 = require("./openai/openai-compatible.provider");
const yandex_gpt_provider_1 = require("./yandex/yandex-gpt.provider");
const ollama_provider_1 = require("./ollama/ollama.provider");
const provider_factory_1 = require("./factory/provider.factory");
let ProvidersModule = class ProvidersModule {
};
exports.ProvidersModule = ProvidersModule;
exports.ProvidersModule = ProvidersModule = __decorate([
    (0, common_1.Module)({
        providers: [
            openai_compatible_provider_1.OpenAICompatibleProvider,
            yandex_gpt_provider_1.YandexGPTProvider,
            ollama_provider_1.OllamaProvider,
            provider_factory_1.ProviderFactory,
        ],
        exports: [provider_factory_1.ProviderFactory],
    })
], ProvidersModule);
//# sourceMappingURL=providers.module.js.map