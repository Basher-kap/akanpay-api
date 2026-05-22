import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Anonymous } from '../decorators';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Anonymous()
  @Get()
  liveness() {
    return this.healthService.liveness();
  }

  @Anonymous()
  @Get('ready')
  async readiness() {
    return this.healthService.readiness();
  }
}
