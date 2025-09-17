import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateProductTableToSetMaxQuantity1702978930089 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE sku MODIFY COLUMN max_quantity_allowed_cart INT DEFAULT 10;');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
