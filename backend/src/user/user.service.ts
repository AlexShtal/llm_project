import {
  ConflictException,
  Injectable,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateModelDto } from './dto/create.model.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Injectable()
@UseGuards(JwtAuthGuard)
export class UserService {
  constructor(private prisma: PrismaService) {}

  async addModel(userId: number, dto: CreateModelDto) {
    const existing = await this.prisma.model.findFirst({
      where: {
        userId,
        name: dto.name,
      },
    });

    if (existing) {
      throw new ConflictException('Модель с таким названием уже существует');
    }

    return this.prisma.model.create({
      data: {
        userId,
        name: dto.name,
        apiOrIP: dto.apiOrIP,
        description: dto.description,
      },
    });
  }

  async getMyModels(userId: number) {
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

  async setCurrentModel(userId: number, modelId: number) {
    const model = await this.prisma.model.findFirst({
      where: { id: modelId, userId },
    });

    if (!model) {
      throw new NotFoundException(
        'Модель не найдена, сначала добавьте модель.',
      );
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

  async deleteModel(userId: number, modelId: number) {
    const model = await this.prisma.model.findFirst({
      where: { id: modelId, userId },
    });

    if (!model) {
      throw new NotFoundException('Модель не найдена');
    }

    // Если удаляемая модель была текущей — сбрасываем currentModelId
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { currentModelId: true },
    });

    await this.prisma.model.delete({
      where: { id: modelId },
    });

    // Если удалённая модель была текущей — сбрасываем
    if (user?.currentModelId === modelId) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { currentModelId: null },
      });
    }

    return { message: 'Модель успешно удалена' };
  }

  async findById(userId: number) {
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
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async deleteUser(userId: number): Promise<string> {
    await this.prisma.user.delete({
      where: { id: userId },
    });
    return 'User deleted successfully';
  }
}
