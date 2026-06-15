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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt_1 = require("bcrypt");
const jwt_1 = require("@nestjs/jwt");
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async register({ email, username, password }) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [{ email: email }, { username: username }],
            },
        });
        if (existingUser !== null) {
            throw new common_1.BadRequestException('Пользователь с таким email или username уже существует');
        }
        const hashedPassword = await (0, bcrypt_1.hash)(password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: email,
                username: username,
                passwordHash: hashedPassword,
            },
        });
        const { passwordHash, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            access_token: this.jwtService.sign({ sub: user.id }),
        };
    }
    async login({ email, password }) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser === null) {
            throw new common_1.BadRequestException('Invalid email or password');
        }
        const isMatch = await (0, bcrypt_1.compare)(password, existingUser.passwordHash);
        if (!isMatch) {
            throw new common_1.BadRequestException('Invalid email or password');
        }
        const { passwordHash, ...userWithoutPassword } = existingUser;
        return {
            user: userWithoutPassword,
            access_token: this.jwtService.sign({ sub: existingUser.id }),
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map