import { Body, Controller, Get, Post } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserService } from './user.service';
import { Roles } from 'src/decorators';
import { Role } from 'src/enums';
import { CreateUserDto, UserResponseDto } from 'src/dto';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  @Roles(Role.User, Role.Admin)
  @ApiOkResponse({ type: UserResponseDto, isArray: true })
  async findAll() {
    const users = await this.service.findAll();
    return users.map((user) => plainToInstance(UserResponseDto, user));
  }

  @Post()
  @Roles(Role.Admin)
  @ApiOkResponse({ type: UserResponseDto })
  async create(@Body() createDto: CreateUserDto) {
    const user = await this.service.create(createDto);
    return plainToInstance(UserResponseDto, user);
  }
}
