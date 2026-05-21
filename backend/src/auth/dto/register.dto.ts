import { IsEmail, IsString } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  password: string;

  @IsString({ message: 'Username must be a string' })
  username: string;
}
