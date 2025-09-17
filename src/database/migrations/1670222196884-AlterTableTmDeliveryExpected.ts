import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterTableTmDeliveryExpected1670222196884 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('RENAME TABLE tm_delivery_expected TO tm_delivery_expected_delhivery');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('RENAME TABLE tm_delivery_expected_delhivery TO tm_delivery_expected');

    }

}
