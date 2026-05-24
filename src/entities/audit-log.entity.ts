import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum AuditAction {
  LOGIN_SUCCESS      = 'LOGIN_SUCCESS',
  LOGIN_FAILED       = 'LOGIN_FAILED',
  REGISTER           = 'REGISTER',
  LOGOUT             = 'LOGOUT',
  TOKEN_REFRESH      = 'TOKEN_REFRESH',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
}

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;                     // unique ID for each log entry

  @Column({ type: 'int', nullable: true })
  userId: number | null;          // whose the action (null if unknown)

  @Column({ type: 'varchar', nullable: true })
  IDNumber: string | null;        // and their university ID 

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;            

  @Column({ type: 'boolean', default: false })
  success: boolean;              

  @Column({ type: 'varchar', nullable: true })
  ipAddress: string | null;       // where the request came from

  @Column({ type: 'varchar', nullable: true })
  details: string | null;         // any extra details like "Wrong password"

  @CreateDateColumn()
  timestamp: Date;                // when it happened 
}