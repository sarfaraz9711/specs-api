import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterIngenicoOrder1671024029393 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `tt_ingenico_order_data` ADD COLUMN pay_ref varchar(255) DEFAULT NULL after order_id');

        await queryRunner.query('ALTER TABLE `tt_ingenico_order_data` ADD COLUMN tpslTxnId varchar(255) DEFAULT NULL after pay_ref');

        await queryRunner.query('ALTER TABLE `tt_ingenico_order_data` ADD COLUMN pay_status varchar(50) DEFAULT NULL after generated_token');

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `tt_ingenico_order_data` DROP COLUMN pay_ref');
        await queryRunner.query('ALTER TABLE `tt_ingenico_order_data` DROP COLUMN tpslTxnId');
        await queryRunner.query('ALTER TABLE `tt_ingenico_order_data` DROP COLUMN pay_status');
       
    }

}
