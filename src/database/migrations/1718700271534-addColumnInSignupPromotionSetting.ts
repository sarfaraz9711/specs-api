import {MigrationInterface, QueryRunner,TableColumn} from "typeorm";

export class addColumnInSignupPromotionSetting1718700271534 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const isBannerImage = await queryRunner.hasColumn('signup_popup_image', 'signup_promotion_setting');
        if (!isBannerImage) {
        await queryRunner.addColumn('signup_promotion_setting', new TableColumn({
            name: 'signup_popup_image',
            type: 'text',
            isPrimary: false,
            isNullable: true
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('signup_promotion_setting', 'signup_popup_image');

    }

}
