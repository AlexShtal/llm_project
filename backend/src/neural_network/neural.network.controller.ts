import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GenerateDto } from './dto/generate.dto';
import { NeuralNetworkService } from './neural.network.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class NeuralNetworkController {
  constructor(private readonly NeuralNetworkService: NeuralNetworkService) {}
  @Post('generate')
  async generateResponse(@Body() generateDto: GenerateDto) {
    return this.NeuralNetworkService.generateResponse(generateDto.prompt);
  }
}
