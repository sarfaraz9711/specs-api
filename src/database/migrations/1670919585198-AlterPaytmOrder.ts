import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterPaytmOrder1670919585198 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `tt_paytm_order` ADD COLUMN txn_id varchar(255) DEFAULT NULL');
        await queryRunner.query('ALTER TABLE `tt_paytm_order` ADD COLUMN paytm_signature varchar(255) DEFAULT NULL');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `tt_paytm_order` DROP COLUMN txn_id');
        await queryRunner.query('ALTER TABLE `tt_paytm_order` DROP COLUMN paytm_signature');
    }

}
