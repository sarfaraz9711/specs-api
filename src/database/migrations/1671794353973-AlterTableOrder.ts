import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterTableOrder1671794353973 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('alter table `order` modify column payment_address_1 TEXT')
        await queryRunner.query('alter table `order` modify column shipping_address_1 TEXT')
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('alter table `order` modify column payment_address_1 TEXT')
        await queryRunner.query('alter table `order` modify column shipping_address_1 TEXT')
    }

}
