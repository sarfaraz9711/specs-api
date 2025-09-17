import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterMigPaymentData1669038902090 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('alter table tt_mig_old_payment_details add column payment_status varchar(10)');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `tt_mig_old_payment_details` DROP COLUMN `payment_status`');
    }

}
