import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email for registration' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({ example: 'P@ssw0rd', description: 'Password for registration' })
  @IsString({ message: 'Password must be a string' })
  password: string;

  @ApiProperty({ example: 'alex', description: 'Username for registration' })
  @IsString({ message: 'Username must be a string' })
  username: string;
}
