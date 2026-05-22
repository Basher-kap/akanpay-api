import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialUser1716000000000 implements MigrationInterface {
  name = 'InitialUser1716000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_roles_enum" AS ENUM('user', 'admin')`,
    );
    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "username" character varying NOT NULL,
        "password" character varying NOT NULL,
        "refreshTokenHash" text,
        "tokenVersion" integer NOT NULL DEFAULT 0,
        "roles" "public"."user_roles_enum" array NOT NULL DEFAULT '{user}',
        CONSTRAINT "UQ_user_username" UNIQUE ("username"),
        CONSTRAINT "PK_user_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TYPE "public"."user_roles_enum"`);
  }
}
