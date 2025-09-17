import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterMigOldPayment1669096215916 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('alter table tt_mig_old_payment_details add column payment_mode varchar(20)');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `tt_mig_old_payment_details` DROP COLUMN `payment_mode`');
    }

}
