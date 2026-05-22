import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../enums';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  username: string;

  @ApiProperty({ enum: Role, isArray: true })
  roles: Role[];
}
