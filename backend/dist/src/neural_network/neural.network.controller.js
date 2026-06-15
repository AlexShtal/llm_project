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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeuralNetworkController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const create_chat_dto_1 = require("./dto/create.chat.dto");
const generate_dto_1 = require("./dto/generate.dto");
const neural_network_service_1 = require("./neural.network.service");
const update_chat_dto_1 = require("./dto/update.chat.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let NeuralNetworkController = class NeuralNetworkController {
    neuralNetworkService;
    constructor(neuralNetworkService) {
        this.neuralNetworkService = neuralNetworkService;
    }
    async getChats(req) {
        return this.neuralNetworkService.getChats(req.user.id);
    }
    async getChat(req, id) {
        return this.neuralNetworkService.getChat(req.user.id, id);
    }
    async createChat(req, dto) {
        return this.neuralNetworkService.createChat(req.user.id, dto.title);
    }
    async updateChat(req, id, dto) {
        return this.neuralNetworkService.updateChat(req.user.id, id, dto.title);
    }
    async deleteChat(req, id) {
        return this.neuralNetworkService.deleteChat(req.user.id, id);
    }
    async generateResponse(req, generateDto) {
        return this.neuralNetworkService.generateResponse(req.user.id, generateDto.prompt, generateDto.chatId, generateDto.modelId);
    }
};
exports.NeuralNetworkController = NeuralNetworkController;
__decorate([
    (0, common_1.Get)('chats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of chats for current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Chats retrieved successfully.' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NeuralNetworkController.prototype, "getChats", null);
__decorate([
    (0, common_1.Get)('chats/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get chat by id' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Chat retrieved successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Chat not found.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], NeuralNetworkController.prototype, "getChat", null);
__decorate([
    (0, common_1.Post)('chats'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new chat session' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Chat created successfully.' }),
    (0, swagger_1.ApiBody)({ type: create_chat_dto_1.CreateChatDto }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_chat_dto_1.CreateChatDto]),
    __metadata("design:returntype", Promise)
], NeuralNetworkController.prototype, "createChat", null);
__decorate([
    (0, common_1.Patch)('chats/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update chat title' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Chat updated successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Chat not found.' }),
    (0, swagger_1.ApiBody)({ type: update_chat_dto_1.UpdateChatDto }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_chat_dto_1.UpdateChatDto]),
    __metadata("design:returntype", Promise)
], NeuralNetworkController.prototype, "updateChat", null);
__decorate([
    (0, common_1.Delete)('chats/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a chat session' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Chat deleted successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Chat not found.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], NeuralNetworkController.prototype, "deleteChat", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate AI response for prompt' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'AI response generated successfully.',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request.' }),
    (0, swagger_1.ApiBody)({ type: generate_dto_1.GenerateDto }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, generate_dto_1.GenerateDto]),
    __metadata("design:returntype", Promise)
], NeuralNetworkController.prototype, "generateResponse", null);
exports.NeuralNetworkController = NeuralNetworkController = __decorate([
    (0, swagger_1.ApiTags)('AI'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('ai'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [neural_network_service_1.NeuralNetworkService])
], NeuralNetworkController);
//# sourceMappingURL=neural.network.controller.js.map