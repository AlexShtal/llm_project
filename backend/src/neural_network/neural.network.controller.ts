import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateChatDto } from './dto/create.chat.dto';
import { GenerateDto } from './dto/generate.dto';
import { NeuralNetworkService } from './neural.network.service';
import { UpdateChatDto } from './dto/update.chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class NeuralNetworkController {
  constructor(private readonly neuralNetworkService: NeuralNetworkService) {}

  @Get('chats')
  async getChats(@Req() req: any) {
    return this.neuralNetworkService.getChats(req.user.id);
  }

  @Get('chats/:id')
  async getChat(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.neuralNetworkService.getChat(req.user.id, id);
  }

  @Post('chats')
  async createChat(@Req() req: any, @Body() dto: CreateChatDto) {
    return this.neuralNetworkService.createChat(req.user.id, dto.title);
  }

  @Patch('chats/:id')
  async updateChat(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateChatDto,
  ) {
    return this.neuralNetworkService.updateChat(req.user.id, id, dto.title);
  }

  @Delete('chats/:id')
  async deleteChat(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.neuralNetworkService.deleteChat(req.user.id, id);
  }

  @Post('generate')
  async generateResponse(@Req() req: any, @Body() generateDto: GenerateDto) {
    return this.neuralNetworkService.generateResponse(
      req.user.id,
      generateDto.prompt,
      generateDto.chatId,
      generateDto.modelId,
    );
  }
}
