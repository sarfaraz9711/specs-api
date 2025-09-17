import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterOrderReturn1687702681724 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `tm_order_return` CHANGE `order_id` `order_id` VARCHAR(255) NULL' );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `tm_order_return` CHANGE `order_id` `order_id` VARCHAR(255) NULL' );

    }
        
        }
