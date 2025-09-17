import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterDiscountOfferTable1695719646192 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query('ALTER TABLE `tm_discount_offer` CHANGE `product_ids` `product_ids` longtext CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL;');
    }
    

    public async down(queryRunner: QueryRunner): Promise<void> {
        

    }

}
