import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators';
import { Role } from 'src/enums';
import { AuditLogService } from './audit-log.service';

@ApiBearerAuth()
@Controller('audit-log')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Roles(Role.Admin)
  findAll() {
    return this.auditLogService.findAll();
  }

  @Get('user/:userId')
  @Roles(Role.Admin)
  findByUser(@Param('userId') userId: number) {
    return this.auditLogService.findByUser(userId);
  }

  @Get('failed')
  @Roles(Role.Admin)
  findFailed() {
    return this.auditLogService.findFailedAttempts();
  }
}