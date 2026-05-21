import { Module } from '@nestjs/common';
import { NeuralNetworkController } from './neural.network.controller';
import { NeuralNetworkService } from './neural.network.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [NeuralNetworkController],
  providers: [NeuralNetworkService],
})
export class NeuralNetworkModule {}
