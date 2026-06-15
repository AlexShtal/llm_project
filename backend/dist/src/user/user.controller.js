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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const user_service_1 = require("./user.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const create_model_dto_1 = require("./dto/create.model.dto");
const set_current_model_dto_1 = require("./dto/set.current.model.dto");
const delete_model_dto_1 = require("./dto/delete.model.dto");
let UserController = class UserController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    async getProfile(req) {
        return this.userService.findById(req.user.id);
    }
    async deleteUser(req) {
        return this.userService.deleteUser(req.user.id);
    }
    async addModel(req, dto) {
        return this.userService.addModel(req.user.id, dto);
    }
    async getMyModels(req) {
        return this.userService.getMyModels(req.user.id);
    }
    async setCurrentModel(req, body) {
        return this.userService.setCurrentModel(req.user.id, body.modelId);
    }
    async deleteModel(req, body) {
        return this.userService.deleteModel(req.user.id, body.modelId);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Delete)('delete-user'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Post)('add-model'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a new LLM model for the user' }),
    (0, swagger_1.ApiBody)({ type: create_model_dto_1.CreateModelDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Model added successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation failed.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_model_dto_1.CreateModelDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "addModel", null);
__decorate([
    (0, common_1.Get)('my-models'),
    (0, swagger_1.ApiOperation)({ summary: 'Get models owned by the current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Models retrieved successfully.' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMyModels", null);
__decorate([
    (0, common_1.Post)('set-current-model'),
    (0, swagger_1.ApiOperation)({ summary: 'Set the current model for the user' }),
    (0, swagger_1.ApiBody)({ type: set_current_model_dto_1.SetCurrentModelDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Current model updated successfully.',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, set_current_model_dto_1.SetCurrentModelDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "setCurrentModel", null);
__decorate([
    (0, common_1.Delete)('delete-model'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a user model' }),
    (0, swagger_1.ApiBody)({ type: delete_model_dto_1.DeleteModelDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Model deleted successfully.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, delete_model_dto_1.DeleteModelDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteModel", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)('User'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('user'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map