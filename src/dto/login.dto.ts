import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ default: 'user' })
  @IsString()
  @MinLength(3)
  username: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
