import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Anonymous } from './decorators';

@ApiTags('root')
@Controller()
export class AppController {
  @Anonymous()
  @Get()
  getInfo() {
    return {
      name: 'Akan Pay API',
      version: '1.0',
      docs: '/api',
    };
  }
}
