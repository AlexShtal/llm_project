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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let UserService = class UserService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async addModel(userId, dto) {
        const existing = await this.prisma.model.findFirst({
            where: {
                userId,
                name: dto.name,
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Модель с таким названием уже существует');
        }
        return this.prisma.$transaction(async (tx) => {
            const model = await tx.model.create({
                data: {
                    userId,
                    name: dto.name,
                    apiOrIP: dto.apiOrIP,
                    description: dto.description,
                    provider: dto.provider,
                    providerConfig: dto.apiKey ? { apiKey: dto.apiKey } : undefined,
                },
            });
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { currentModelId: true },
            });
            if (!user?.currentModelId) {
                await tx.user.update({
                    where: { id: userId },
                    data: { currentModelId: model.id },
                });
            }
            return model;
        });
    }
    async getMyModels(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                currentModelId: true,
                currentModel: true,
                models: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    }
    async setCurrentModel(userId, modelId) {
        const model = await this.prisma.model.findFirst({
            where: { id: modelId, userId },
        });
        if (!model) {
            throw new common_1.NotFoundException('Модель не найдена, сначала добавьте модель.');
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                currentModelId: modelId,
            },
            include: {
                currentModel: true,
            },
        });
    }
    async deleteModel(userId, modelId) {
        const model = await this.prisma.model.findFirst({
            where: { id: modelId, userId },
        });
        if (!model) {
            throw new common_1.NotFoundException('Модель не найдена');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { currentModelId: true },
        });
        await this.prisma.model.delete({
            where: { id: modelId },
        });
        if (user?.currentModelId === modelId) {
            await this.prisma.user.update({
                where: { id: userId },
                data: { currentModelId: null },
            });
        }
        return { message: 'Модель успешно удалена' };
    }
    async findById(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                avatarUrl: true,
                role: true,
                createdAt: true,
                currentModel: true,
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async deleteUser(userId) {
        await this.prisma.user.delete({
            where: { id: userId },
        });
        return 'User deleted successfully';
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map