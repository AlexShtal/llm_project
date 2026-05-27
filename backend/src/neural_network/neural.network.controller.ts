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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateChatDto } from './dto/create.chat.dto';
import { GenerateDto } from './dto/generate.dto';
import { NeuralNetworkService } from './neural.network.service';
import { UpdateChatDto } from './dto/update.chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('AI')
@ApiBearerAuth('access-token')
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class NeuralNetworkController {
  constructor(private readonly neuralNetworkService: NeuralNetworkService) {}

  @Get('chats')
  @ApiOperation({ summary: 'Get list of chats for current user' })
  @ApiResponse({ status: 200, description: 'Chats retrieved successfully.' })
  async getChats(@Req() req: any) {
    return this.neuralNetworkService.getChats(req.user.id);
  }

  @Get('chats/:id')
  @ApiOperation({ summary: 'Get chat by id' })
  @ApiResponse({ status: 200, description: 'Chat retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Chat not found.' })
  async getChat(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.neuralNetworkService.getChat(req.user.id, id);
  }

  @Post('chats')
  @ApiOperation({ summary: 'Create a new chat session' })
  @ApiResponse({ status: 201, description: 'Chat created successfully.' })
  @ApiBody({ type: CreateChatDto })
  async createChat(@Req() req: any, @Body() dto: CreateChatDto) {
    return this.neuralNetworkService.createChat(req.user.id, dto.title);
  }

  @Patch('chats/:id')
  @ApiOperation({ summary: 'Update chat title' })
  @ApiResponse({ status: 200, description: 'Chat updated successfully.' })
  @ApiResponse({ status: 404, description: 'Chat not found.' })
  @ApiBody({ type: UpdateChatDto })
  async updateChat(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateChatDto,
  ) {
    return this.neuralNetworkService.updateChat(req.user.id, id, dto.title);
  }

  @Delete('chats/:id')
  @ApiOperation({ summary: 'Delete a chat session' })
  @ApiResponse({ status: 200, description: 'Chat deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Chat not found.' })
  async deleteChat(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.neuralNetworkService.deleteChat(req.user.id, id);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate AI response for prompt' })
  @ApiResponse({
    status: 200,
    description: 'AI response generated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid request.' })
  @ApiBody({ type: GenerateDto })
  async generateResponse(@Req() req: any, @Body() generateDto: GenerateDto) {
    return this.neuralNetworkService.generateResponse(
      req.user.id,
      generateDto.prompt,
      generateDto.chatId,
      generateDto.modelId,
    );
  }
}
