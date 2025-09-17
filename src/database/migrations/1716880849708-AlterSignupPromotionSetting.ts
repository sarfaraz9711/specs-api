import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AlterSignupPromotionSetting1716880849708 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const isInventorySync = await queryRunner.hasColumn('coupon_code', 'signup_promotion_setting');
        if (!isInventorySync) {
        await queryRunner.addColumn('signup_promotion_setting', new TableColumn({
            name: 'coupon_code',
            type: 'varchar',
            length: '255',
            isPrimary: false,
            isNullable: true,
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('signup_promotion_setting', 'coupon_code');

    }

}
