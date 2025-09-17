import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterIngenicoOrderTransaction1671024038599 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `tt_ingenico_order_transaction` ADD COLUMN pay_order_id varchar(255) DEFAULT NULL');
        await queryRunner.query('alter table `tt_ingenico_order_transaction` add column final_response TEXT after hash');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `tt_ingenico_order_transaction` DROP COLUMN pay_order_id');
        await queryRunner.query('ALTER TABLE `tt_ingenico_order_transaction` DROP COLUMN final_response');
        
    }

}
