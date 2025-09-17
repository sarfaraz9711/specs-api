import {MigrationInterface, QueryRunner} from 'typeorm';

export class AlterCouponTable1630672892057 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `coupon` CHANGE `discount` `discount` DECIMAL(10,2)' );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `coupon` CHANGE `discount` `discount` DECIMAL(10,2)' );

    }

}
