import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterMigProductLog1669201263647 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('alter table tt_mig_product_log add column `status` varchar(2) default 1');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('alter table tt_mig_product_log drop column status');
    }

}
