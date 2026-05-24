import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from 'src/entities/audit-log.entity';

interface LogPayload {
  action: AuditAction;
  success: boolean;
  userId?: number | null;
  IDNumber?: string | null;
  ipAddress?: string | null;
  details?: string | null;
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  // the one method everything calls
  async log(payload: LogPayload): Promise<void> {
    const entry = this.auditLogRepository.create({
      userId: payload.userId ?? null,
      IDNumber: payload.IDNumber ?? null,
      action: payload.action,
      success: payload.success,
      ipAddress: payload.ipAddress ?? null,
      details: payload.details ?? null,
    });
    await this.auditLogRepository.save(entry);
  }

  async findAll(): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      order: { timestamp: 'DESC' },  
    });
  }

  // view logs for a specific user
  async findByUser(userId: number): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { userId },
      order: { timestamp: 'DESC' },
    });
  }


  async findFailedAttempts(): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { success: false },
      order: { timestamp: 'DESC' },
    });
  }
}