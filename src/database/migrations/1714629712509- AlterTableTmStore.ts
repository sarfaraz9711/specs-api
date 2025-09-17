import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterTableTmStore1714629712509 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE tm_store MODIFY COLUMN google_location TEXT');

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE tm_store MODIFY COLUMN google_location varchar(255)');

    }

}
