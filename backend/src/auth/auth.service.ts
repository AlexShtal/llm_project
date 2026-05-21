/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { hash, compare } from 'bcrypt';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login,dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register({ email, username, password }: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser !== null) {
      throw new BadRequestException(
        'User with this email or username already exists',
      );
    }

    const hashedPassword: string = await hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: email,
        username: username,
        passwordHash: hashedPassword,
      },
    });

    return user;
  }

  async login({
    email,
    password,
  }: LoginDto): Promise<{ existingUser: User; token: string }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser === null) {
      throw new BadRequestException('Invalid email or password');
    }

    const isMatch: boolean = await compare(password, existingUser.passwordHash);

    if (!isMatch) {
      throw new BadRequestException('Invalid email or password');
    }

    return {
      existingUser,
      token: this.jwtService.sign({ sub: existingUser.id }),
    };
  }
}
