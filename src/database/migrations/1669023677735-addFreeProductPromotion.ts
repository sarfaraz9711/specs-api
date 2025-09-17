import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddFreeProductPromotion1669023677735 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const percentageDiscount = await queryRunner.hasColumn('tm_freeproductpromotions', 'promotion_percentage_discount');
        if (!percentageDiscount) {
        await queryRunner.addColumn('tm_freeproductpromotions', new TableColumn({
                name: 'promotion_percentage_discount',
                type: 'int',
                length: '11',
                isPrimary: false,
                isNullable: true,
            }));
        }
        const discouctAmount = await queryRunner.hasColumn('tm_freeproductpromotions', 'promotion_discount_Amount');
        if (!discouctAmount) {
        await queryRunner.addColumn('tm_freeproductpromotions', new TableColumn({
                name: 'promotion_discount_Amount',
                type: 'int',
                length: '11',
                isPrimary: false,
                isNullable: true,
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('tm_freeproductpromotions', 'promotion_percentage_discount');
        await queryRunner.dropColumn('tm_freeproductpromotions', 'promotion_discount_Amount');
    }

}
