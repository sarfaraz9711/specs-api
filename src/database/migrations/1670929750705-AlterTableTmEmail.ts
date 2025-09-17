import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterTableTmEmail1670929750705 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE tm_email DROP COLUMN CREATED_ON');

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE tm_email ADD COLUMN CREATED_ON varchar(255) default null');

    }

}
