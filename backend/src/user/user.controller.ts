/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Delete,
  Get,
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
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateModelDto } from './dto/create.model.dto';
import { SetCurrentModelDto } from './dto/set.current.model.dto';
import { DeleteModelDto } from './dto/delete.model.dto';

@ApiTags('User')
@ApiBearerAuth('access-token')
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getProfile(@Req() req: any) {
    return this.userService.findById(req.user.id);
  }

  @Delete('delete-user')
  async deleteUser(@Req() req: any) {
    return this.userService.deleteUser(req.user.id);
  }

  @Post('add-model')
  @ApiOperation({ summary: 'Add a new LLM model for the user' })
  @ApiBody({ type: CreateModelDto })
  @ApiResponse({ status: 201, description: 'Model added successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  async addModel(@Req() req: any, @Body() dto: CreateModelDto) {
    return this.userService.addModel(req.user.id, dto);
  }

  @Get('my-models')
  @ApiOperation({ summary: 'Get models owned by the current user' })
  @ApiResponse({ status: 200, description: 'Models retrieved successfully.' })
  async getMyModels(@Req() req: any) {
    return this.userService.getMyModels(req.user.id);
  }

  @Post('set-current-model')
  @ApiOperation({ summary: 'Set the current model for the user' })
  @ApiBody({ type: SetCurrentModelDto })
  @ApiResponse({
    status: 200,
    description: 'Current model updated successfully.',
  })
  async setCurrentModel(@Req() req: any, @Body() body: SetCurrentModelDto) {
    return this.userService.setCurrentModel(req.user.id, body.modelId);
  }

  @Delete('delete-model')
  @ApiOperation({ summary: 'Delete a user model' })
  @ApiBody({ type: DeleteModelDto })
  @ApiResponse({ status: 200, description: 'Model deleted successfully.' })
  async deleteModel(@Req() req: any, @Body() body: DeleteModelDto) {
    return this.userService.deleteModel(req.user.id, body.modelId);
  }
}
