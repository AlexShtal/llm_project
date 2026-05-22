import { Module } from '@nestjs/common';
import { NeuralNetworkController } from './neural.network.controller';
import { NeuralNetworkService } from './neural.network.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [NeuralNetworkController],
  providers: [NeuralNetworkService],
})
export class NeuralNetworkModule {}
