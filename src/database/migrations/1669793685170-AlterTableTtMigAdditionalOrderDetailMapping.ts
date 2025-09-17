import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterTableTtMigAdditionalOrderDetailMapping1669793685170 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `tt_mig_additional_order_details_mapping` CHANGE COLUMN shop_id store_id INT(11) DEFAULT NULL');

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `tt_mig_additional_order_details_mapping` CHANGE COLUMN store_id shop_id INT(11) DEFAULT NULL');

    }

}
