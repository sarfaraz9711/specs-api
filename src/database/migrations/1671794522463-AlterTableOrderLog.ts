import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterTableOrderLog1671794522463 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('alter table `order_log` modify column payment_address_1 TEXT')
        await queryRunner.query('alter table `order_log` modify column shipping_address_1 TEXT')
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('alter table `order_log` modify column payment_address_1 TEXT')
        await queryRunner.query('alter table `order_log` modify column shipping_address_1 TEXT')
    }

}
