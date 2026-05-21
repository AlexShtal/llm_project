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
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateModelDto } from './dto/create.model.dto';
import { SetCurrentModelDto } from './dto/set.current.model.dto';
import { DeleteModelDto } from './dto/delete.model.dto';

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
  async addModel(@Req() req: any, @Body() dto: CreateModelDto) {
    return this.userService.addModel(req.user.id, dto);
  }

  @Get('my-models')
  async getMyModels(@Req() req: any) {
    return this.userService.getMyModels(req.user.id);
  }

  @Post('set-current-model')
  async setCurrentModel(@Req() req: any, @Body() body: SetCurrentModelDto) {
    return this.userService.setCurrentModel(req.user.id, body.modelId);
  }

  @Delete('delete-model')
  async deleteModel(@Req() req: any, @Body() body: DeleteModelDto) {
    return this.userService.deleteModel(req.user.id, body.modelId);
  }
}
