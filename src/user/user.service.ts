import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { User } from 'src/entities';
import { Role } from 'src/enums';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll() {
    return this.usersRepository.find();
  }
  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {
        username: username,
      },
    });
  }
  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {
        id: id,
      },
    });
  }
  async create(createDto: CreateUserDto): Promise<User> {
    const existing = await this.findOne(createDto.username);
    if (existing) {
      throw new ConflictException('Username already exists');
    }
    const passwordHash = await bcrypt.hash(createDto.password, 10);
    const user = this.usersRepository.create({
      ...createDto,
      password: passwordHash,
      roles: [Role.User],
    });
    return this.usersRepository.save(user);
  }

  async setRefreshToken(userId: number, refreshToken: string): Promise<void> {
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.usersRepository.update(userId, { refreshTokenHash });
  }

  async clearRefreshToken(userId: number): Promise<void> {
    await this.usersRepository.update(userId, { refreshTokenHash: null });
  }

  async incrementTokenVersion(userId: number): Promise<void> {
    await this.usersRepository.increment({ id: userId }, 'tokenVersion', 1);
  }
}
