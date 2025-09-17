import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterCoupponColumn1687635723110 implements MigrationInterface {

        public async up(queryRunner: QueryRunner): Promise<void> {
            await queryRunner.query('ALTER TABLE `tm_coupon_based_promotion` CHANGE `order_id` `order_id` VARCHAR(255) NULL' );
        }
    
        public async down(queryRunner: QueryRunner): Promise<void> {
            await queryRunner.query('ALTER TABLE `tm_coupon_based_promotion` CHANGE `order_id` `order_id` VARCHAR(255) NULL' );
    
        }
    
    }
    


