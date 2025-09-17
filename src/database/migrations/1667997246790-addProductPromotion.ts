import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddProductPromotion1667997246790 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const promotionFlag = await queryRunner.hasColumn('product', 'promotion_flag');
        if (!promotionFlag) {
        await queryRunner.addColumn('product', new TableColumn({
                name: 'promotion_flag',
                type: 'int',
                length: '11',
                isPrimary: false,
                isNullable: true,
            }));
        }
        const promotionId = await queryRunner.hasColumn('product', 'promotion_id');
        if (!promotionId) {
        await queryRunner.addColumn('product', new TableColumn({
                name: 'promotion_id',
                type: 'int',
                length: '11',
                isPrimary: false,
                isNullable: true,
            }));
        }
        const promotionType = await queryRunner.hasColumn('product', 'promotion_type');
        if (!promotionType) {
        await queryRunner.addColumn('product', new TableColumn({
                name: 'promotion_type',
                type: 'varchar',
                length: '255',
                isPrimary: false,
                isNullable: true,
            }));
        }
        const promotionProductYId = await queryRunner.hasColumn('product', 'promotion_product_y_id');
        if (!promotionProductYId) {
        await queryRunner.addColumn('product', new TableColumn({
                name: 'promotion_product_y_id',
                type: 'int',
                length: '11',
                isPrimary: false,
                isNullable: true,
            }));
        }
        const promotionFreeProductPrice = await queryRunner.hasColumn('product', 'promotion_free_product_price');
        if (!promotionFreeProductPrice) {
        await queryRunner.addColumn('product', new TableColumn({
                name: 'promotion_free_product_price',
                type: 'int',
                length: '11',
                isPrimary: false,
                isNullable: true,
            }));
        }

        const promotionProductYSlug = await queryRunner.hasColumn('product', 'promotion_product_y_slug');
        if (!promotionProductYSlug) {
        await queryRunner.addColumn('product', new TableColumn({
                name: 'promotion_product_y_slug',
                type: 'varchar',
                length: '255',
                isPrimary: false,
                isNullable: true,
            }));
        }
        const productSellingPrice = await queryRunner.hasColumn('product', 'product_selling_price');
        if (!productSellingPrice) {
        await queryRunner.addColumn('product', new TableColumn({
                name: 'product_selling_price',
                type: 'int',
                length: '11',
                isPrimary: false,
                isNullable: true,
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('product', 'promotion_flag');
        await queryRunner.dropColumn('product', 'promotion_type');
        await queryRunner.dropColumn('product', 'promotion_product_y_id');
        await queryRunner.dropColumn('product', 'promotion_product_y_slug');
        await queryRunner.dropColumn('product', 'promotion_free_product_price');
        await queryRunner.dropColumn('product', 'product_selling_price');
    }

}
