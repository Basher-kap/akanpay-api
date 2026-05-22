import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  liveness() {
    return {
      status: 'ok',
      service: 'akan-pay-api',
    };
  }

  async readiness() {
    await this.dataSource.query('SELECT 1');
    return {
      status: 'ok',
      database: 'up',
    };
  }
}
